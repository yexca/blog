FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# amd64 or arm64
ARG TARGETARCH

# 设置版本变量
ARG HUGO_VERSION="0.140.1"

# 安装依赖
RUN apt-get update && apt-get install -y git curl

# 根据架构动态拼接下载链接
RUN case "${TARGETARCH}" in \
    "amd64") ARCH="linux-64bit" ;; \
    "arm64") ARCH="linux-arm64" ;; \
    *) echo "Unsupported architecture: ${TARGETARCH}"; exit 1 ;; \
    esac && \
    curl -L -o hugo.tar.gz "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_${ARCH}.tar.gz" \
    && tar -xzf hugo.tar.gz \
    && mv hugo /usr/local/bin/ \
    && rm hugo.tar.gz

# 验证安装
RUN hugo version

# 暴露 Hugo 默认端口
EXPOSE 1313