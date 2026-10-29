FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# amd64 or arm64
ARG TARGETARCH

# 设置版本变量
ARG HUGO_VERSION="0.166.0"

# 安装依赖
RUN apt-get update && apt-get install -y git curl \
    && rm -rf /var/lib/apt/lists/*

# 根据架构动态拼接下载链接（发布包命名为 linux-amd64 / linux-arm64）
# curl -f：下载失败（如 404）时直接报错，而不是把错误页当成压缩包
RUN case "${TARGETARCH}" in \
    "amd64") ARCH="linux-amd64" ;; \
    "arm64") ARCH="linux-arm64" ;; \
    *) echo "Unsupported architecture: ${TARGETARCH}"; exit 1 ;; \
    esac && \
    curl -fsSL -o hugo.tar.gz "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_${ARCH}.tar.gz" \
    && tar -xzf hugo.tar.gz \
    && mv hugo /usr/local/bin/ \
    && rm hugo.tar.gz

# 验证安装
RUN hugo version

# 暴露 Hugo 默认端口
EXPOSE 1313