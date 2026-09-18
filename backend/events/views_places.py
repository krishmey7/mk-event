"""
Proxy Nominatim (OpenStreetMap) — recherche et géocodage inverse.
Respecte la politique d’usage (User-Agent, cache court, debounce côté client).
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from django.core.cache import cache
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search"
NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse"
USER_AGENT = "MK-Event/1.0 (https://mk-event-five.vercel.app; contact@mkevent.app)"
CACHE_TTL = 60 * 60  # 1 h
MIN_INTERVAL_S = 1.0

_last_upstream = 0.0


def _throttle() -> None:
    global _last_upstream
    now = time.monotonic()
    wait = MIN_INTERVAL_S - (now - _last_upstream)
    if wait > 0:
        time.sleep(wait)
    _last_upstream = time.monotonic()


def _nominatim_get(url: str, params: dict[str, str]) -> list[dict[str, Any]] | dict[str, Any] | None:
    query = urllib.parse.urlencode(params)
    full = f"{url}?{query}"
    cache_key = f"nominatim:{full}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    _throttle()
    req = urllib.request.Request(
        full,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
        return None

    cache.set(cache_key, payload, CACHE_TTL)
    return payload


def _normalize_hit(row: dict[str, Any]) -> dict[str, Any] | None:
    try:
        lat = float(row.get("lat"))
        lng = float(row.get("lon"))
    except (TypeError, ValueError):
        return None

    address = row.get("address") if isinstance(row.get("address"), dict) else {}
    name = (
        address.get("amenity")
        or address.get("tourism")
        or address.get("building")
        or address.get("hotel")
        or address.get("leisure")
        or row.get("name")
        or ""
    )
    street_parts = [
        address.get("house_number"),
        address.get("road") or address.get("pedestrian") or address.get("footway"),
    ]
    street = " ".join(p for p in street_parts if p).strip()
    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or address.get("county")
        or ""
    )
    zip_code = address.get("postcode") or ""
    display = row.get("display_name") or ""
    if not name and display:
        name = display.split(",")[0].strip()

    return {
        "display_name": display,
        "name": name,
        "street": street,
        "zip": zip_code,
        "city": city,
        "lat": lat,
        "lng": lng,
    }


class PlaceSearchView(APIView):
    """GET /api/places/search/?q=…"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        if len(q) < 3:
            return Response({"results": []})

        raw = _nominatim_get(
            NOMINATIM_SEARCH,
            {
                "q": q,
                "format": "json",
                "addressdetails": "1",
                "limit": "6",
            },
        )
        if raw is None:
            return Response(
                {"detail": "Recherche de lieu indisponible. Réessayez dans un instant."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if not isinstance(raw, list):
            return Response({"results": []})

        results = []
        for row in raw:
            if isinstance(row, dict):
                hit = _normalize_hit(row)
                if hit:
                    results.append(hit)
        return Response({"results": results})


class PlaceReverseView(APIView):
    """GET /api/places/locate/?q=adresse complète — géocode une adresse texte."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        if len(q) < 3:
            return Response(
                {"detail": "Adresse trop courte."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw = _nominatim_get(
            NOMINATIM_SEARCH,
            {
                "q": q,
                "format": "json",
                "addressdetails": "1",
                "limit": "1",
            },
        )
        if raw is None or not isinstance(raw, list) or not raw:
            return Response(
                {"detail": "Impossible de localiser cette adresse."},
                status=status.HTTP_404_NOT_FOUND,
            )
        hit = _normalize_hit(raw[0]) if isinstance(raw[0], dict) else None
        if not hit:
            return Response(
                {"detail": "Impossible de localiser cette adresse."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(hit)
