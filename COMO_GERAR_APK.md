# Como gerar o APK do DM Motos

## Pré-requisitos
- Node.js instalado
- Android Studio instalado
- Java JDK 17+ instalado

---

## Passo 1 — Clonar e instalar dependências
```bash
git clone https://github.com/petrykpm/DMotos.git
cd DMotos
npm install
```

## Passo 2 — Gerar o build e adicionar plataforma Android
```bash
npm run build
npx cap add android
npx cap sync android
```

## Passo 3 — Abrir no Android Studio
```bash
npx cap open android
```
Isso abre o projeto Android diretamente no Android Studio.

## Passo 4 — Gerar o APK no Android Studio
1. No Android Studio, vá em **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Aguarda o build terminar
3. Clica em **"locate"** no aviso que aparece no canto inferior direito
4. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

## Passo 5 — Instalar no celular
1. Transfira o `app-debug.apk` para o celular (WhatsApp, cabo USB, Google Drive)
2. No celular, ative **"Instalar de fontes desconhecidas"** nas configurações
3. Abra o arquivo APK e instale

---

## Atualizar o app depois de mudanças
```bash
npm run cap:build
npx cap open android
```
Depois só gerar o APK de novo no Android Studio (Build → Build APK).

---

## Observações
- O APK gerado é **debug** — funciona normalmente para uso interno
- Para distribuir na Play Store precisaria assinar com keystore (release APK)
- O app precisa de internet para funcionar (Supabase online)
