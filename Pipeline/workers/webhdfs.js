const axios = require("axios");

const HDFS_URL = process.env.HDFS_URL || "http://namenode:9870/webhdfs/v1";
const HDFS_USER = process.env.HDFS_USER || "root";

const withUser = (url) =>
  `${url}${url.includes("?") ? "&" : "?"}user.name=${encodeURIComponent(HDFS_USER)}`;

async function listStatus(dirPath) {
  // dirPath must start with `/data_lake/...`
  try {
    const response = await axios.get(
      withUser(`${HDFS_URL}${dirPath}?op=LISTSTATUS`)
    );
    return response.data?.FileStatuses?.FileStatus || [];
  } catch (err) {
    // If the directory doesn't exist, treat as empty.
    return [];
  }
}

async function openJson(filePath) {
  try {
    const response = await axios.get(withUser(`${HDFS_URL}${filePath}?op=OPEN`), {
      responseType: "json"
    });
    return response.data;
  } catch (err) {
    return null;
  }
}

async function createJson(filePath, payload) {
  const hdfsPath = `${filePath}`;

  const initResponse = await axios.put(
    withUser(`${HDFS_URL}${hdfsPath}?op=CREATE&overwrite=true`),
    null,
    {
      maxRedirects: 0,
      validateStatus: (status) => status === 307
    }
  );

  const redirectURL = initResponse.headers.location;
  const body = Buffer.from(JSON.stringify(payload));

  await axios.put(redirectURL, body, {
    headers: { "Content-Type": "application/json" }
  });
}

module.exports = {
  listStatus,
  openJson,
  createJson
};

