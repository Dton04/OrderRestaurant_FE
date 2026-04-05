# OrderRestaurant FE

Frontend React + Vite cho he thong quan ly nha hang.

## API Configuration

- Dev mac dinh dung Vite proxy:
  - FE goi API qua prefix `/api/*`.
  - Vite rewrite va forward den `http://localhost:3000/*`.
- Production:
  - Set `VITE_API_URL` de goi truc tiep backend (vi du `https://api.example.com`).

## Env

Tao file `.env.local` (hoac `.env`) neu can override:

```bash
VITE_API_URL=http://localhost:3000
```

Neu khong set `VITE_API_URL`:

- `development`: FE dung `'/api'` (proxy).
- `production`: fallback `http://localhost:3000`.

## Run

```bash
npm install
npm run dev
```
