FROM node:20-alpine

WORKDIR /usr/src/app

# انسخ package أولاً لتستفيد من cache
COPY package*.json ./

# ثبّت كل الحزم بما فيها dev deps (مهم للتطوير)
RUN npm install

# ثبت nodemon عالميًا (مفيد للتطوير)
RUN npm install -g nodemon

# انسخ باقي المشروع
COPY . .

EXPOSE 3000

# أثناء التطوير
CMD ["npm", "run", "dev"]
