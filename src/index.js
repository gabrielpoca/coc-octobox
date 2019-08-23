const { commands, workspace, listManager } = require("coc.nvim");
const axios = require("axios");
const { Notifications } = require("./notifications");

console.log(Notifications);

exports.activate = context => {
  workspace.showMessage("coc-octobox activating");
  const { subscriptions } = context;

  const baseURL = process.env.OCTOBOX_URL;
  const token = process.env.OCTOBOX_TOKEN;

  const axiosInstance = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Octobox-API": 1
    }
  });

  subscriptions.push(
    listManager.registerList(new Notifications(axiosInstance, workspace))
  );
};
