# Login Kit — "Green" kirish sahifasi

Barcha loyihalarda bir xil kirish sahifasi. **Faqat React kerak** — i18n,
redux, axios, antd yoki dizayn tizimiga bog'liq emas.

```
login-kit/
  LoginPage.jsx    asosiy komponent (forma, tema, validatsiya)
  LoginScene.jsx   chap paneldagi animatsion sahna
  BioGlobe.jsx     jonlantirilgan biometrik globus
  loginKit.css     barcha uslublar + ranglar (tokenlar ichida)
  index.js
```

## O'rnatish

1. `login-kit` papkasini loyihangizning `src/` ichiga ko'chiring.
2. Ishlating:

```jsx
import LoginPage from './login-kit';

export default function Login() {
    return (
        <LoginPage
            onSubmit={async ({login, password}) => {
                const {data} = await axios.post('/api/sign-in', {login, password});
                localStorage.setItem('token', data.accessToken);
                window.location.replace('/');
            }}
        />
    );
}
```

Shu holicha ham to'liq ishlaydi — qolgan hamma narsa ixtiyoriy.

## Xatolikni ko'rsatish

`onSubmit` xato tashlasa, matn formada qizil blokda chiqadi:

```jsx
onSubmit={async ({login, password}) => {
    try {
        await api.signIn(login, password);
    } catch (e) {
        throw new Error(e?.response?.data?.msg || 'Login yoki parol xato');
    }
}}
```

Bo'sh maydonlar `onSubmit` gacha o'zi tekshiriladi.

## Prop'lar

| Prop | Turi | Default | Nima |
|---|---|---|---|
| `onSubmit` | `({login, password}) => Promise` | — | Kirish so'rovi |
| `logo` | React tugun | `null` | `<img src={logo}/>` yoki matn |
| `texts` | obyekt | o'zbekcha | Matnlarni qisman almashtiradi |
| `aside` | `{title, subtitle, features}` | bo'sh | Chap paneldagi matn |
| `defaultTheme` | `'dark' \| 'light' \| 'system'` | `'dark'` | Boshlang'ich tema |
| `themeToggle` | `boolean` | `true` | Tema tugmasi ko'rinsinmi |
| `topbarExtra` | React tugun | `null` | Til tanlash kabi qo'shimcha boshqaruv |

### To'liq misol

```jsx
<LoginPage
    logo={<img src={logo} alt="Kompaniya"/>}
    defaultTheme="dark"
    texts={{title: 'Xush kelibsiz', submit: 'Davom etish'}}
    aside={{
        title: 'Xodimlar hisobi va kirish nazorati',
        subtitle: "Turniketdan o'tish, tabel va kadrlar hujjatlari — bitta tizimda.",
        features: [
            {icon: <UserIcon/>, title: 'Turniket real vaqtda', text: 'Kirish va chiqish avtomatik qayd etiladi'},
            {icon: <ClockIcon/>, title: "Tabel o'zi shakllanadi", text: "Ish soati va kechikish hisobi"},
        ],
    }}
    onSubmit={signIn}
/>
```

## Brend rangini almashtirish

`loginKit.css` boshidagi uchta o'zgaruvchi — butun sahifa shularga ergashadi:

```css
.lg-page {
    --brand-500: #16b364;   /* dark temadagi asosiy */
    --brand-600: #099250;   /* tugma, fokus */
    --brand-700: #087443;   /* tugma hover (light) */
}
```

Chap paneldagi yashil sahna ranglari `--brand-*` ga bog'liq emas (ular
qat'iy `#29b85d` / `#4ade80`) — brend boshqa rangda bo'lsa,
`loginKit.css` dagi `.lg-globe*`, `.lg-trace`, `.lg-chip__*` va
`.lg-aside__glow` qiymatlarini ham almashtiring.

## Eslatmalar

- **Shrift:** Inter ko'zda tutilgan. Loyihangizda ulanmagan bo'lsa tizim
  shriftiga tushadi — xohlasangiz Google Fonts orqali ulang.
- **960px dan tor ekranda** chap panel yashiriladi, faqat forma qoladi.
- Barcha tugmalarga aniq balandlik berilgan — loyihangizda global
  `button { height: … }` qoidasi bo'lsa ham ko'rinish buzilmaydi.
- Animatsiyalar OS ning "harakatni kamaytirish" sozlamasidan qat'i nazar
  ishlaydi. Kerak bo'lsa `loginKit.css` oxiriga
  `@media (prefers-reduced-motion: reduce) { … animation: none }` qo'shing.
