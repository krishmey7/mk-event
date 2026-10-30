import logging
import os
import re
import uuid
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

import requests
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AdminEarning, AdminWithdrawal, EventPayment

logger = logging.getLogger(__name__)
User = get_user_model()
KIBAWALLET_API = "https://kibawallet-api.onrender.com"
WITHDRAWAL_FEE_RATE = Decimal("0.01")
CENT = Decimal("0.01")


def is_payout_admin(user):
    return bool(user and user.is_authenticated and (user.is_superuser or user.role == "admin"))


def _kiba_headers():
    public_key = os.getenv("KIBA_PUBLIC_KEY", "").strip()
    secret_key = os.getenv("KIBA_SECRET_KEY", "").strip()
    if not public_key or not secret_key:
        return None
    return {
        "Content-Type": "application/json",
        "X-Kiba-Public-Key": public_key,
        "Authorization": f"Bearer {secret_key}",
    }


def _provider_message(response):
    try:
        data = response.json()
    except ValueError:
        return ""
    if not isinstance(data, dict):
        return ""
    for key in ("message", "detail", "error"):
        value = data.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()[:300]
    return ""


def _ledger_balance(user_id, currency):
    earned = AdminEarning.objects.filter(
        user_id=user_id,
        currency=currency,
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    reserved = AdminWithdrawal.objects.filter(
        user_id=user_id,
        currency=currency,
    ).exclude(status=AdminWithdrawal.Status.FAILED).aggregate(
        total=Sum("amount_debited"),
    )["total"] or Decimal("0.00")
    return max(Decimal("0.00"), earned - reserved)


class AdminWalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_payout_admin(request.user):
            return Response(
                {"detail": "Cette page est réservée aux administrateurs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        page_raw = request.query_params.get("page", "1")
        try:
            page = int(page_raw)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Numéro de page invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if page < 1 or page > 10000:
            return Response(
                {"detail": "Numéro de page hors limites."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.is_superuser:
            earning_qs = AdminEarning.objects.select_related(
                "user",
                "payment__event",
            )
            withdrawal_qs = AdminWithdrawal.objects.select_related("user")
            payment_qs = EventPayment.objects.select_related("event__organizer")
        else:
            earning_qs = AdminEarning.objects.filter(user=request.user).select_related(
                "payment__event",
            )
            withdrawal_qs = AdminWithdrawal.objects.filter(user=request.user)
            payment_qs = None

        limit = 50
        end = page * limit + 1
        transactions = []
        for earning in earning_qs[:end]:
            transactions.append(
                {
                    "id": f"earning-{earning.id}",
                    "type": "earning",
                    "created_at": earning.created_at,
                    "status": "succeeded",
                    "user_id": earning.user_id,
                    "user_name": earning.user.full_name,
                    "amount": str(earning.amount),
                    "fee": "0.00",
                    "amount_debited": "0.00",
                    "currency": earning.currency,
                    "share_percent": str(earning.share_percent),
                    "external_reference": earning.payment.external_reference,
                    "provider_reference": earning.payment.provider_payment_id or "",
                    "account": "",
                    "event_name": earning.payment.event.name,
                }
            )
        for withdrawal in withdrawal_qs[:end]:
            transactions.append(
                {
                    "id": f"withdrawal-{withdrawal.id}",
                    "type": "withdrawal",
                    "created_at": withdrawal.created_at,
                    "status": withdrawal.status,
                    "user_id": withdrawal.user_id,
                    "user_name": withdrawal.user.full_name,
                    "amount": str(withdrawal.amount),
                    "fee": str(withdrawal.fee),
                    "amount_debited": str(withdrawal.amount_debited),
                    "currency": withdrawal.currency,
                    "share_percent": None,
                    "external_reference": withdrawal.external_reference,
                    "provider_reference": withdrawal.provider_reference,
                    "account": withdrawal.account,
                    "event_name": "",
                }
            )
        if payment_qs is not None:
            for payment in payment_qs[:end]:
                transactions.append(
                    {
                        "id": f"payment-{payment.id}",
                        "type": "incoming_payment",
                        "created_at": payment.created_at,
                        "status": payment.status,
                        "user_id": payment.event.organizer_id,
                        "user_name": payment.event.organizer.full_name,
                        "amount": str(payment.amount_net or payment.amount),
                        "fee": "0.00",
                        "amount_debited": "0.00",
                        "currency": payment.currency,
                        "share_percent": None,
                        "external_reference": payment.external_reference,
                        "provider_reference": payment.provider_payment_id or "",
                        "account": "",
                        "event_name": payment.event.name,
                    }
                )
        transactions.sort(key=lambda item: (item["created_at"], item["id"]), reverse=True)
        start = (page - 1) * limit
        page_transactions = transactions[start : start + limit]
        for item in page_transactions:
            item["created_at"] = item["created_at"].isoformat()

        eligible_users = list(
            User.objects.filter(
                Q(is_superuser=True) | Q(role=User.Role.ADMIN),
            ).order_by("id")
        ) if request.user.is_superuser else []
        return Response(
            {
                "is_superuser": request.user.is_superuser,
                "share_percent": str(request.user.payout_share_percent),
                "balances": {
                    currency: str(_ledger_balance(request.user.id, currency))
                    for currency in ("USD", "CDF")
                },
                "transactions": page_transactions,
                "has_more": len(transactions) > start + limit,
                "next_page": page + 1 if len(transactions) > start + limit else None,
                "admin_balances": [
                    {
                        "user_id": user.id,
                        "user_name": user.full_name,
                        "share_percent": str(user.payout_share_percent),
                        "USD": str(_ledger_balance(user.id, "USD")),
                        "CDF": str(_ledger_balance(user.id, "CDF")),
                    }
                    for user in eligible_users
                ],
            }
        )


class AdminWithdrawalSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("1.00"),
    )
    currency = serializers.ChoiceField(choices=("USD", "CDF"))
    account = serializers.CharField(min_length=8, max_length=32, trim_whitespace=True)

    def validate_account(self, value):
        normalized = value.replace(" ", "")
        if not re.fullmatch(r"\+?\d{8,31}", normalized):
            raise serializers.ValidationError("Entrez un numéro Mobile Money valide.")
        return normalized


class AdminWithdrawalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not is_payout_admin(request.user):
            return Response(
                {"detail": "Cette page est réservée aux administrateurs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AdminWithdrawalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]
        currency = serializer.validated_data["currency"]
        account = serializer.validated_data["account"]
        fee = (amount * WITHDRAWAL_FEE_RATE).quantize(CENT, rounding=ROUND_HALF_UP)
        amount_debited = amount + fee

        with transaction.atomic():
            User.objects.select_for_update().get(pk=request.user.pk)
            available = _ledger_balance(request.user.id, currency)
            if amount_debited > available:
                return Response(
                    {
                        "detail": (
                            f"Solde insuffisant : {available} {currency} disponibles "
                            f"(frais inclus)."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            headers = _kiba_headers()
            if headers is None:
                return Response(
                    {"detail": "Le service de retrait n’est pas configuré."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            external_reference = f"mkp-{request.user.id}-{uuid.uuid4().hex}"
            withdrawal = AdminWithdrawal.objects.create(
                user=request.user,
                external_reference=external_reference,
                account=account,
                amount=amount,
                fee=fee,
                amount_debited=amount_debited,
                currency=currency,
            )

            try:
                wallet_response = requests.get(
                    f"{KIBAWALLET_API}/v1/wallet",
                    headers=headers,
                    params={"currency": currency},
                    timeout=20,
                )
            except requests.RequestException:
                logger.exception(
                    "KibaWallet wallet balance check failed for currency=%s",
                    currency,
                )
                withdrawal.delete()
                return Response(
                    {"detail": "Impossible de vérifier le solde KibaWallet. Réessayez."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            if not wallet_response.ok:
                logger.warning(
                    "KibaWallet wallet check rejected: status=%s message=%s",
                    wallet_response.status_code,
                    _provider_message(wallet_response) or "no provider message",
                )
                withdrawal.delete()
                return Response(
                    {"detail": "Impossible de vérifier le solde du wallet KibaWallet."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            try:
                wallet_data = wallet_response.json()
                provider_balance = Decimal(str(wallet_data["balance"]))
            except (ValueError, TypeError, KeyError, InvalidOperation):
                withdrawal.delete()
                return Response(
                    {"detail": "Réponse de solde KibaWallet invalide."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            if provider_balance < amount_debited:
                withdrawal.delete()
                return Response(
                    {
                        "detail": (
                            f"Le wallet marchand ne dispose pas de {amount_debited} "
                            f"{currency} pour ce retrait."
                        )
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            payload = {
                "external_reference": external_reference,
                "account_type": "mobile",
                "account": account,
                "amount": float(amount),
                "currency": currency,
                "description": f"MK Events admin payout {request.user.id}",
            }
            try:
                response = requests.post(
                    f"{KIBAWALLET_API}/v1/withdrawals",
                    headers=headers,
                    json=payload,
                    timeout=30,
                )
            except requests.RequestException:
                logger.exception(
                    "KibaWallet withdrawal outcome unknown: reference=%s",
                    external_reference,
                )
                return Response(
                    {
                        "detail": (
                            "Résultat du retrait inconnu. Le montant reste réservé "
                            "jusqu’à la confirmation KibaWallet."
                        ),
                        "external_reference": external_reference,
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            if not response.ok:
                provider_message = _provider_message(response)
                logger.warning(
                    "KibaWallet withdrawal rejected: status=%s reference=%s message=%s",
                    response.status_code,
                    external_reference,
                    provider_message or "no provider message",
                )
                if response.status_code < 500:
                    withdrawal.status = AdminWithdrawal.Status.FAILED
                    withdrawal.completed_at = timezone.now()
                    withdrawal.save(update_fields=["status", "completed_at", "updated_at"])
                    return Response(
                        {
                            "detail": (
                                f"Retrait refusé par KibaWallet (HTTP {response.status_code})."
                                + (f" {provider_message}" if provider_message else "")
                            )
                        },
                        status=status.HTTP_502_BAD_GATEWAY,
                    )
                return Response(
                    {
                        "detail": (
                            "KibaWallet n’a pas confirmé le retrait. Le montant reste "
                            "réservé pendant la vérification."
                        ),
                        "external_reference": external_reference,
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            try:
                result = response.json()
            except ValueError:
                result = None
            if not isinstance(result, dict):
                return Response(
                    {
                        "detail": (
                            "Réponse KibaWallet invalide. Le retrait reste réservé "
                            "jusqu’à réception du webhook."
                        ),
                        "external_reference": external_reference,
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            provider_id = result.get("id") or result.get("withdrawal_id")
            if not provider_id:
                return Response(
                    {
                        "detail": (
                            "Identifiant KibaWallet manquant. Le retrait reste réservé "
                            "jusqu’à réception du webhook."
                        ),
                        "external_reference": external_reference,
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            withdrawal.provider_withdrawal_id = str(provider_id)
            withdrawal.provider_reference = str(result.get("reference") or "")
            try:
                actual_fee = result.get("fee_withdrawal")
                actual_debit = result.get("amount_debited")
                if actual_fee is not None:
                    withdrawal.fee = Decimal(str(actual_fee))
                if actual_debit is not None:
                    withdrawal.amount_debited = Decimal(str(actual_debit))
            except InvalidOperation:
                return Response(
                    {
                        "detail": (
                            "Montant des frais KibaWallet invalide. Le retrait reste réservé "
                            "jusqu’à réception du webhook."
                        ),
                        "external_reference": external_reference,
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            withdrawal.save(
                update_fields=[
                    "provider_withdrawal_id",
                    "provider_reference",
                    "fee",
                    "amount_debited",
                    "updated_at",
                ]
            )

        return Response(
            {
                "external_reference": withdrawal.external_reference,
                "provider_withdrawal_id": withdrawal.provider_withdrawal_id,
                "status": withdrawal.status,
                "amount": str(withdrawal.amount),
                "fee": str(withdrawal.fee),
                "amount_debited": str(withdrawal.amount_debited),
                "currency": withdrawal.currency,
                "account": withdrawal.account,
            },
            status=status.HTTP_201_CREATED,
        )
