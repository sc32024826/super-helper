// 基础配置
const config = {
  baseURL: import.meta.env.VITE_BASE_URL, // 基础URL
  timeout: 10000, // 超时时间
  header: {
    "Content-Type": "application/json",
  },
};

class HttpRequest {
  private static instance: HttpRequest;
  private config: typeof config;

  private constructor() {
    this.config = config;
  }

  public static getInstance(): HttpRequest {
    if (!HttpRequest.instance) {
      HttpRequest.instance = new HttpRequest();
    }
    return HttpRequest.instance;
  }

  // 请求拦截器
  private requestInterceptor(options: any) {
    // 添加token
    const token = uni.getStorageSync("token");

    if (token) {
      options.header = {
        ...options.header,
        Authorization: `Bearer ${token}`,
      };
    }

    // 添加基础URL
    if (!options.url.startsWith("http")) {
      options.url = this.config.baseURL + options.url;
    }

    return options;
  }

  // 响应拦截器
  private responseInterceptor(response: any) {
    const { statusCode, data } = response;

    // 请求成功
    if (statusCode >= 200 && statusCode < 300) {
      return data;
    }

    // 处理错误
    const error = new Error(data.message || "请求失败");
    throw error;
  }

  // 错误处理
  private errorHandler(error: any) {
    // 处理网络错误
    if (error.errMsg?.includes("timeout")) {
      uni.showToast({
        title: "请求超时",
        icon: "none",
      });
      return Promise.reject(new Error("请求超时"));
    }

    // 处理业务错误
    if (error.response?.statusCode === 401) {
      // 未授权，跳转登录页
      uni.navigateTo({
        url: "/pages/login/index",
      });
      return Promise.reject(new Error("未授权"));
    }

    uni.showToast({
      title: error.message || "请求失败",
      icon: "none",
    });

    return Promise.reject(error);
  }

  // 请求方法
  private request(options: any): Promise<any> {
    // 合并配置
    const requestOptions = {
      ...this.config,
      ...options,
      timeout: options.timeout || this.config.timeout,
    };

    // 应用请求拦截器
    const interceptedOptions = this.requestInterceptor(requestOptions);

    // 发起请求
    return new Promise((resolve, reject) => {
      uni.request({
        ...interceptedOptions,
        success: (res: any) => {
          try {
            const result = this.responseInterceptor(res);
            resolve(result);
          } catch (error) {
            this.errorHandler(error);
          }
        },
        fail: (error: Error) => {
          this.errorHandler(error);
        },
      });
    });
  }

  // 封装常用请求方法
  public get(url: string, data?: any, options?: Partial<any>) {
    return this.request({
      url,
      data,
      method: "GET",
      ...options,
    });
  }

  public post(url: string, data?: any, options?: Partial<any>) {
    return this.request({
      url,
      data,
      method: "POST",
      ...options,
    });
  }

  public put(url: string, data?: any, options?: Partial<any>) {
    return this.request({
      url,
      data,
      method: "PUT",
      ...options,
    });
  }

  public delete(url: string, data?: any, options?: Partial<any>) {
    return this.request({
      url,
      data,
      method: "DELETE",
      ...options,
    });
  }
}

// 导出单例实例
export const http = HttpRequest.getInstance();
export default http;
