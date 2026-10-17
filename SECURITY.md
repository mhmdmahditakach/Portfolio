# Security Architecture & Hardening (معايير الأمان والحماية)

تم بناء المشروع وفق أفضل الممارسات الأمنية لتطبيقات الواجهة الأمامية (Front-End Security Best Practices):

1. **الحماية من ثغرات حقن الكود (XSS Prevention):**
   - جميع المدخلات النصية والبيانات المعروضة في الصفحة تمر عبر دالة تعقيم صارمة (`escapeHtml`) قبل توليد العناصر، أو تُسند نصياً عبر `textContent` و`value`.
2. **أمان الروابط الخارجية (Reverse Tabnabbing Protection):**
   - جميع الروابط التي تفتح في نافذة جديدة (`target="_blank"`) محمية بسمة `rel="noopener noreferrer"` لمنع الصفحة المفتوحة من الوصول إلى كائن `window.opener`.
3. **التخزين المحلي الآمن (Safe Storage Isolation):**
   - التعامل مع `localStorage` مغلف داخل كتل `try/catch` آمنة لمنع تعطل الموقع في بيئات التصفح المقيدة أو وضع التصفح الخفي.
4. **عدم وجود تبعيات خلفية أو مفاتيح سرية مكشوفة (Zero Exposed Secrets):**
   - الموقع يعمل بالكامل كواجهة ثابتة تفاعلية (Static Interactive JAMstack) دون قواعد بيانات مكشوفة أو مفاتيح API خاصة في الكود المصدري.
