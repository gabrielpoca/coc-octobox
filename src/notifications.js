const child_process = require("child_process");

class Notifications {
  constructor(axios, workspace) {
    this.name = "octobox";
    this.description = "octobox notifications list";
    this.defaultAction = "open";
    this.actions = [];
    this.axios = axios;
    this.workspace = workspace;

    this.actions = [
      {
        name: "open",
        persist: true,
        reload: true,
        execute: item => {
          child_process.spawnSync("open", [item.data.web_url]);
          return this.axios
            .post(`/notifications/mark_read_selected.json?id=${item.data.id}`)
            .catch(e => console.error(e));
        }
      },
      {
        name: "archive",
        persist: true,
        reload: true,
        execute: item => {
          return this.axios
            .post(`/notifications/archive_selected.json?id=${item.data.id}`)
            .catch(e => console.error(e));
        }
      },
      {
        name: "mute",
        persist: true,
        reload: true,
        execute: item => {
          return this.axios
            .post(`/notifications/mute_selected.json?id=${item.data.id}`)
            .catch(e => console.error(e));
        }
      }
    ];
  }

  async loadItems(_context) {
    const result = await this.axios.get("notifications.json");

    return result.data.notifications
      .filter(({ archived }) => !archived)
      .map(notif => {
        console.log(notif);
        return { label: this.buildLabel(notif), data: notif };
      });
  }

  buildLabel({ subject, unread, reason }) {
    return `${unread ? "unread" : "read"} ${subject.title} ${reason}`;
  }
}

exports.Notifications = Notifications;
