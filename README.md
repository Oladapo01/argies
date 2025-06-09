# 🎂 Argies Cakes Ordering Platform

A modern, responsive web application for a cake and pastry business offering a delightful user experience for browsing, customizing, and ordering products — complete with SumUp and PayPal payment integrations.

## 📦 Features

- 🍰 Browse categorized menu: Cakes, Pastries, Brownies, Sourdough, and more
- 🛒 Add to cart and view total order
- 📋 Checkout form with:
  - Name & Email collection
  - Cake size selection
- 💳 Payments via:
  - [SumUp API](https://developer.sumup.com/)
  - [PayPal JavaScript SDK](https://developer.paypal.com/)
- 🎨 Vegan / Vegetarian / Gluten-Free / Dairy-Free labels on products
- 📍 Location banners and pickup details
- 📑 Cancellation and damage policy notices
- 🔧 JSON-based menu for easy updates

---

## 🖥️ Tech Stack

| Frontend     | Tools / Libraries                            |
|--------------|-----------------------------------------------|
| React        | Functional components & Hooks                |
| Styled-Components | Theming & modular CSS                     |
| Framer Motion | Cart animation and modal transitions         |
| Formik + Yup | Form management and validation                |
| React Router | Client-side routing                          |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/argies-cakes.git
cd argies-cakes
````

### 2. Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root with:

```env
REACT_APP_TILE_SERVER=https://tile.openstreetmap.org/{z}/{x}/{y}.png
REACT_APP_TILE_ATTRIBUTION=© OpenStreetMap contributors
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_SUMUP_API_KEY=your_sumup_access_token
```

---

## 🧪 Development

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Build for Production

```bash
npm run build
```

This generates optimized static files for deployment in the `/build` directory.

---

## 💳 Payments

### ✅ SumUp Integration

* Uses [SumUp Checkout API](https://developer.sumup.com/checkout-api/).
* Token securely stored in environment variable.
* Checkout button triggers server-side order request.

### ✅ PayPal Integration

* Uses client-side JS SDK.
* Automatically renders buttons and handles order capture.

---

## 📜 Policies

* ⚠️ **Cancellation Policy:** Deposits are non-refundable unless cancellation is made at least **36 hours** in advance.
* ⚠️ **Transport Policy:** Customers are responsible for cake condition after pickup.

---

## 📁 File Structure Highlights

```
src/
├── components/
│   ├── Menu.js
│   ├── CartModal.js
│   ├── CheckoutForm.js
│   ├── SumUpCheckout.js
│   ├── PayPalCheckout.js
│   └── ...
├── context/
│   └── CartContext.js
├── data/
│   └── menu.json
└── App.js
```

---

## 📬 Contact & Credits

Made with ❤️ for Argies Cakes.
For custom orders or issues, email: [hello@argiescakes.com](mailto:hello@argiescakes.com)

---

## ✅ License

MIT © 2025 Argies Cakes
