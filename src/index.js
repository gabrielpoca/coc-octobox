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

  context.subscriptions.push(
    commands.registerCommand("octobox.list", async () => {
      const res = await axiosInstance.get("notifications.json");

      console.log(res.data);
      res.data.notifications.map(notif => console.log(notif.subject.title));
      // FINISH THIS PART
    })
  );
};