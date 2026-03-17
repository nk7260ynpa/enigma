FROM nginx:alpine

# 移除預設頁面
RUN rm -rf /usr/share/nginx/html/*

# 複製自訂 nginx 設定
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 複製靜態檔案
COPY src/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
