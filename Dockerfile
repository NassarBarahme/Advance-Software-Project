FROM node:18-alpine

# إنشاء مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production

# نسخ باقي الملفات
COPY . .

# إنشاء مجلد للرفع إن لم يكن موجوداً
RUN mkdir -p uploads

# تعيين الصلاحيات
RUN chmod -R 755 /app

# عرض المنفذ
EXPOSE 3000

# متغيرات البيئة (يمكن تجاوزها في docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# فحص صحة الحاوية
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# تشغيل التطبيق
CMD ["node", "index.js"]