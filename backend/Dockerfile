# استخدم نسخة رسمية من Node.js
FROM node:20-alpine

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات package.json و package-lock.json
COPY package*.json ./

# تثبيت الباكدجات (Run npm install)
RUN npm install

# نسخ باقي ملفات المشروع (index.js)
COPY . .

# فتح بورت 3000
EXPOSE 3000

# تشغيل التطبيق
CMD ["node", "index.js"]