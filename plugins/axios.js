export default ({ $axios, $config }) => {
  // リクエストログ
  $axios.onRequest((config) => {
    config.params = config.params || {}
    config.params.key = $config.apiKey
    return config
  })
  // レスポンスログ
  $axios.onResponse((config) => {
    // console.log(config)
  })
  // エラーログ
  $axios.onError((e) => {
    const res = e.response
    console.log(res)
  })
}
