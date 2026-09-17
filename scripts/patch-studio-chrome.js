const fs = require('fs');
const path = require('path');

const roots = [
  path.join('app', '(app)', 'editor'),
];

const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p);
  }
}
roots.forEach(walk);

let n = 0;
for (const file of files) {
  if (file.includes('previsualisation')) continue;
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  if (!s.includes('useEditor') || !s.includes('theme.colors')) continue;

  if (!s.includes("useStudioChrome")) {
    if (s.includes("from '@/features/editor/EditorContext'")) {
      s = s.replace(
        "from '@/features/editor/EditorContext';",
        "from '@/features/editor/EditorContext';\nimport { useStudioChrome } from '@/features/editor/useStudioChrome';",
      );
    } else if (s.includes("from '../EditorContext'")) {
      s = s.replace(
        "from '../EditorContext';",
        "from '../EditorContext';\nimport { useStudioChrome } from '../useStudioChrome';",
      );
    }
  }

  s = s.replace(
    /const \{([^}]*)\} = useEditor\(\);\r?\n\s*const (c|colors) = theme\.colors;/g,
    (_, inner, name) => {
      const cleaned = inner
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x && x !== 'theme' && !x.startsWith('theme '))
        .join(', ');
      return `const {${cleaned}} = useEditor();\n  const ${name} = useStudioChrome();`;
    },
  );

  // Remaining invitation theme.colors in UI files -> chrome
  if (s.includes('useStudioChrome()')) {
    s = s.replace(/theme\.colors/g, (match, offset) => {
      // keep if somehow still needed - replace all in these UI screens
      return 'colors';
    });
    // If variable was `c`, fix accidental `colors.xxx` when code used `c`
    // Also fix `const colors = useStudioChrome` + usages of `c.` that remain
  }

  // Fix: screens that used `const c = useStudioChrome` but replacements made `colors.bg`
  // Re-read: if we have `const c = useStudioChrome` then theme.colors became colors - bad
  if (/const c = useStudioChrome\(\)/.test(s) && /\bcolors\./.test(s)) {
    s = s.replace(/\bcolors\./g, 'c.');
  }
  // If we have `const colors = useStudioChrome` and leftover `c.` from theme destructure
  if (/const colors = useStudioChrome\(\)/.test(s)) {
    // histoire uses theme.colors.X inline - already colors.X
  }

  // Remove unused theme from destructure leftovers like `const { theme } = useEditor` alone
  s = s.replace(/const \{ theme \} = useEditor\(\);\r?\n\s*const (c|colors) = useStudioChrome\(\);/g,
    'const $1 = useStudioChrome();');

  // StatusBar theme.isDark - use app theme instead if present
  if (s.includes('theme.isDark') && s.includes('useStudioChrome')) {
    if (!s.includes('useAppTheme')) {
      s = s.replace(
        "import { useStudioChrome } from '@/features/editor/useStudioChrome';",
        "import { useStudioChrome } from '@/features/editor/useStudioChrome';\nimport { useAppTheme } from '@/context/ThemePreferenceContext';",
      );
    }
    if (!s.includes('const { theme: appTheme') && !s.includes('mode } = useAppTheme')) {
      s = s.replace(
        /const (c|colors) = useStudioChrome\(\);/,
        "const $1 = useStudioChrome();\n  const { mode } = useAppTheme();",
      );
    }
    s = s.replace(/theme\.isDark \? 'light' : 'dark'/g, "mode === 'dark' ? 'light' : 'dark'");
  }

  if (s !== orig) {
    fs.writeFileSync(file, s);
    n += 1;
    console.log('patched', file);
  }
}
console.log('total', n);
