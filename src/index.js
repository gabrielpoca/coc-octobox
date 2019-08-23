const { commands, workspace, listManager } = require("coc.nvim");
const axios = require("axios");
const { Notifications } = require("./notifications");

exports.activate = context => {
  const { subscriptions } = context;
  const config = workspace.getConfiguration("octobox");

  const baseURL = process.env.OCTOBOX_URL;
  const token = process.env.OCTOBOX_TOKEN;

  if (!baseURL)
    return workspace.showMessage(
      "coc-octobox could not find OCTOBOX_URL in your environment. For more information read the README.",
      "error"
    );

  if (!token)
    return workspace.showMessage(
      "coc-octobox could not find OCTOBOX_TOKEN in your environment. For more information read the README.",
      "error"
    );

  const axiosInstance = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Octobox-API": 1
    }
  });

  subscriptions.push(
    listManager.registerList(
      new Notifications(axiosInstance, workspace, config)
    )
  );
};
