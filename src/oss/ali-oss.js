import OSS from 'ali-oss'
import axios from 'axios'

/**
 * 获取 ali-oss token 凭证
 */
function getAliToken() {
  return new Promise((resolve, reject) => {
    // request
    axios
      .post('/rpc/spwapi/admin/sts', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((res) => {
        if (!res.errno) {
          res.data.Data = JSON.parse(res.data.Data)
          resolve(res.data.Data)
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function clientObj(params) {
  return new OSS({
    region: 'oss-ap-southeast-1', // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    accessKeyId: params.Credentials.AccessKeyId, // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
    accessKeySecret: params.Credentials.AccessKeySecret,
    stsToken: params.Credentials.SecurityToken, // 从STS服务获取的安全令牌（SecurityToken）。
    refreshSTSToken: async () => {
      // 向您搭建的STS服务获取临时访问凭证。
      const info = await getAliToken()
      return {
        accessKeyId: info.Credentials.AccessKeyId,
        accessKeySecret: info.Credentials.AccessKeySecret,
        stsToken: info.Credentials.SecurityToken,
      }
    },
    refreshSTSTokenInterval: 300000, // 刷新临时访问凭证的时间间隔，单位为毫秒。
    bucket: 'aidestiny', // 填写Bucket名称。
    secure: true,
  })
}

function getFileName() {
  return `${new Date().getTime()}${Math.floor(Math.random() * 150)}`
}

async function isExistObject(name, options = {}) {
  // oss copy 文件
  const data = await getAliToken()
  let client = clientObj(data)
  try {
    await client.head(name, options)
    console.log('file exists')
    return true
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      console.log('file does not exist')
    }
    return false
  }
}

export { getAliToken, clientObj, getFileName, isExistObject }
