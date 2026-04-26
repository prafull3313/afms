# Firebase Setup

## 1. Create project
- Open `https://console.firebase.google.com/`
- Click `Create a project`
- Create a Web App inside that project

## 2. Enable Firestore
- In Firebase Console: `Build` -> `Firestore Database`
- Click `Create database`
- Start in `Production mode`
- Choose a region close to your users

## 3. Add Firestore rules
- In Firebase Console: `Firestore Database` -> `Rules`
- Replace the existing rules with the contents of [firestore.rules](/d:/Code/afms/firestore.rules)
- Publish the rules

These rules:
- allow public reads for the entries page
- allow public creates for new form submissions
- block update/delete
- validate the exact fields and allowed values for your form

## 4. Copy Firebase web config
- In Firebase Console: `Project settings` -> `General`
- Under `Your apps` -> choose your Web App
- Find the config values and copy:

```txt
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

## 5. Local development
Create `.env.local` in the project root with:

```txt
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

You can use [.env.example](/d:/Code/afms/.env.example) as the template.

## 6. GitHub Pages deployment
In GitHub repo settings:
- Open `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`
- Add these repository variables:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

The workflow file [deploy-pages.yml](/d:/Code/afms/.github/workflows/deploy-pages.yml) already reads them during the Pages build.

## 7. Notes
- This setup is free on Firebase Spark for small usage.
- Firestore free quota includes reads/writes each day.
- Entries will now be shared across devices because they are stored in Firestore instead of browser local storage.
