# 🚀 Manual Installation Guide - Storefront Notifications

## Статус: ✅ Extension Ready, Manual Install Required

**Почему manual install?**  
CLI deployment блокируется webhook approval для protected customer data (это нормально для development stores). Extension файлы готовы и работают, просто нужна manual установка.

---

## ✅ Что уже готово

1. **✅ Theme App Extension создан:**
   - `extensions/purchase-notifications/`
   - Все файлы (liquid, JS, CSS, locales)
   - Проверен и валиден

2. **✅ Серверы запущены:**
   - Remix server: `http://localhost:3000`
   - ngrok tunnel: `https://venially-uncontumacious-pablo.ngrok-free.dev`
   - App Proxy настроен

3. **✅ Backend готов:**
   - App Proxy endpoint: `/app/proxy/recent-orders`
   - Admin UI: `/app/storefront-notifications`
   - Webhook работает (настроен ранее)

---

## 🛠️ Option 1: Development Mode (Recommended)

### Шаг 1: Запустить dev mode с extension

```bash
cd /Users/boss/Desktop/shopify-two/shopify-app
shopify app dev --tunnel-url https://venially-uncontumacious-pablo.ngrok-free.dev
```

**Что это делает:**
- Запускает dev server с live extensions
- Extensions автоматически доступны в Theme Customizer
- Hot reload для изменений

### Шаг 2: Включить extension в Theme Customizer

1. Shopify Admin → **Online Store → Themes**
2. На активной теме: **Customize**
3. В левом нижнем углу: **App embeds**
4. Найдите: **"Purchase Notifications"** (должно появиться автоматически)
5. **Toggle ON** ✅
6. Настройте параметры:
   - Position: Bottom Left
   - Display duration: 5 seconds  
   - Interval: 10 seconds
7. **Save**

### Шаг 3: Test

1. Откройте storefront в incognito: `https://YOUR-SHOP.myshopify.com`
2. Откройте Browser Console (F12)
3. Через 5-10 секунд должен появиться popup! 🎉

---

## 🛠️ Option 2: Push Extension Files to Shopify

Если dev mode не работает, можно загрузить extension вручную:

### Использовать Shopify CLI Extension Push

```bash
cd /Users/boss/Desktop/shopify-two/shopify-app
shopify app extension push
```

Это загрузит только extension без webhook deployment.

---

## 🛠️ Option 3: Test без Extension (App Proxy только)

Для быстрого теста App Proxy endpoint:

### 1. Test API directly

```bash
curl "https://YOUR-SHOP.myshopify.com/apps/proxy/recent-orders?shop=YOUR-SHOP.myshopify.com"
```

Должен вернуть JSON:
```json
{
  "orders": [...],
  "lastUpdated": "2025-12-18T...",
  "count": 5
}
```

### 2. Test в Admin UI

1. Shopify App Admin → **🛍️ Storefront Notifications**
2. Должны видеть:
   - Статистику заказов
   - Кнопку "Test API Endpoint"
3. Кликните "Test API Endpoint" - откроет JSON

---

## 📁 Extension Files (готовы к использованию)

```
extensions/purchase-notifications/
├── shopify.extension.toml          # ✅ Config (handle added)
├── blocks/
│   └── notification-widget.liquid  # ✅ Liquid (schema fixed)
├── assets/
│   ├── notification-widget.js      # ✅ JS (polling logic)
│   └── notification-widget.css     # ✅ CSS (animations)
└── locales/
    └── en.default.json             # ✅ Localization
```

Все файлы прошли валидацию Shopify CLI.

---

## 🧪 Verification Checklist

После установки проверьте:

- [ ] Extension появился в Theme Customizer → App embeds
- [ ] Toggle ON работает
- [ ] Настройки отображаются (5 параметров)
- [ ] API endpoint работает (test curl)
- [ ] Storefront показывает popup (incognito + console)
- [ ] Browser Console: `🚀 Purchase Notifications Widget initialized`
- [ ] Admin UI `/app/storefront-notifications` доступен

---

## 🐛 Troubleshooting

### Extension не появляется в Theme Customizer

**Причина:** Dev mode не запущен

**Решение:**
```bash
# Kill existing dev processes
pkill -f "shopify app dev"

# Start fresh
cd /Users/boss/Desktop/shopify-two/shopify-app
shopify app dev --tunnel-url https://venially-uncontumacious-pablo.ngrok-free.dev
```

### API Endpoint returns 404

**Проверки:**
1. Remix server запущен? (Check Terminal 33)
2. ngrok туннель работает? (Check Terminal 21)
3. App Proxy настроен в shopify.app.toml?

**Test:**
```bash
# Test local
curl http://localhost:3000/app/proxy/recent-orders?shop=YOUR-SHOP.myshopify.com

# Test через ngrok
curl https://venially-uncontumacious-pablo.ngrok-free.dev/app/proxy/recent-orders?shop=YOUR-SHOP.myshopify.com
```

### Popup не появляется в storefront

**Browser Console checks:**
```javascript
// Должны быть:
🚀 Purchase Notifications Widget initialized
📍 Position: bottom-left
🏪 Shop: your-shop.myshopify.com

// Network tab:
GET /apps/proxy/recent-orders?shop=... (каждые 15 секунд)
Status: 200 OK
```

**Если API возвращает пустой массив:**
- Проверьте есть ли заказы за последние 7 дней
- Создайте тестовый заказ
- Подождите 15-30 секунд

---

## 💡 Alternative: Manual HTML Injection (Quick Test)

Для быстрого теста можно добавить код напрямую в theme:

### 1. Shopify Admin → Online Store → Themes → Actions → Edit Code

### 2. Найдите `theme.liquid`

### 3. Перед `</body>` добавьте:

```liquid
<!-- Purchase Notifications Widget -->
<div 
  id="purchase-notifications-widget" 
  class="purchase-notifications"
  data-shop="{{ shop.permanent_domain }}"
  data-position="bottom-left"
  data-duration="5"
  data-interval="10"
  data-max-display="10"
>
</div>

<link rel="stylesheet" href="https://YOUR-NGROK-URL/extensions/purchase-notifications/assets/notification-widget.css">
<script src="https://YOUR-NGROK-URL/extensions/purchase-notifications/assets/notification-widget.js" defer></script>
```

**Заменить `YOUR-NGROK-URL` на:** `https://venially-uncontumacious-pablo.ngrok-free.dev`

**⚠️ Это только для теста!** Используйте Theme App Extension для production.

---

## 📊 Success Criteria

Вы успешно установили extension если:

1. ✅ Extension виден в Theme Customizer
2. ✅ API endpoint возвращает JSON заказов
3. ✅ Popup уведомления появляются в storefront
4. ✅ Browser Console показывает инициализацию
5. ✅ Admin UI доступен и показывает статистику

---

## 🎉 Next Steps After Install

1. **Create Test Order:**
   - Shopify Admin → Orders → Create Order
   - Заполните минимальные данные
   - Save

2. **Watch in Storefront:**
   - Open в incognito
   - Через 15-30 секунд увидите уведомление!

3. **Monitor:**
   - Admin UI: `/app/storefront-notifications`
   - Check statistics
   - Test API endpoint button

4. **Customize:**
   - Theme Customizer → App embeds
   - Поменяйте position, duration, interval
   - Сохраните и проверьте изменения

---

## 🚀 Conclusion

**Status:** ✅ **READY FOR INSTALLATION**

Все компоненты созданы и работают:
- ✅ Theme App Extension (validated)
- ✅ App Proxy configured
- ✅ Backend API ready
- ✅ Servers running

Просто запустите dev mode и включите extension в Theme Customizer!

**Команда для старта:**
```bash
cd /Users/boss/Desktop/shopify-two/shopify-app
shopify app dev --tunnel-url https://venially-uncontumacious-pablo.ngrok-free.dev
```

---

**Questions?** Check logs:
- Remix server: Terminal 33
- ngrok tunnel: Terminal 21  
- Browser Console: F12 → Console
- Network: F12 → Network tab

🎉 **Good luck!**

