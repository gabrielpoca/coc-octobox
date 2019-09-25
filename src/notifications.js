const child_process = require("child_process");

class Notifications {
  constructor(axios, workspace, config) {
    this.name = "octobox";
    this.description = "octobox notifications list";
    this.defaultAction = "open";
    this.actions = [];
    this.axios = axios;
    this.config = config;
    this.workspace = workspace;
    this.statusItem = workspace.createStatusBarItem(0);

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
          this.updateStatusBar();
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

    this.interval = setInterval(() => this.updateStatusBar(), 30000);
    setTimeout(() => this.updateStatusBar(), 2000);
  }

  dispose() {
    this.statusItem.hide();
    clearInterval(this.interval);
  }

  async loadItems(context) {
    const filters = (context.args || []).reduce((memo, arg) => {
      const [key, values, ..._] = arg.split(":");
      memo[key] = values.split(",");
      return memo;
    }, {});
    const filterKeys = Object.keys(filters);

    const response = await this.axios.get("notifications.json?per_page=100");

    return response.data.notifications
      .map(notif => ({ ...notif, state: notif.subject.state }))
      .filter(notif =>
        filterKeys.every(
          key => filters[key].indexOf(notif[key].toString()) !== -1
        )
      )
      .sort(({ updated_at }) => new Date(updated_at))
      .map(notif => ({ label: this.buildLabel(notif), data: notif }));
  }

  buildLabel({ subject, unread, reason }) {
    return `${unread ? "unread" : "read"} ${
      subject.type === "PullRequest" ? "PR" : subject.type
    } ${subject.state} ${subject.title} ${reason}`;
  }

  doHighlight() {
    const { nvim } = this.workspace;

    nvim.pauseNotification();
    nvim.command(
      `syntax keyword CocOctoboxMerged merged contained containedin=CocOctoboxLine`,
      true
    );
    nvim.command(
      `syntax keyword CocOctoboxOpen open contained containedin=CocOctoboxLine`,
      true
    );
    nvim.command(
      `syntax match CocOctoboxRead /^read\ .*/ contained containedin=CocOctoboxLine`,
      true
    );
    nvim.command("highlight default link CocOctoboxRead Comment", true);
    nvim.command("highlight default link CocOctoboxMerged Constant", true);
    nvim.command("highlight default link CocOctoboxOpen String", true);
    nvim.resumeNotification().catch(_e => {
      // noop
    });
  }

  async updateStatusBar() {
    if (!this.config.get("showInStatusBar")) return;

    try {
      const response = await this.axios.get("notifications/unread_count.json");
      const { count } = response.data;

      if (count) {
        this.statusItem.text = `${this.config.get(
          "iconForStatusBar"
        )} ${count} `;
        this.statusItem.show();
      } else {
        this.statusItem.hide();
      }
    } catch (e) {
      // we probably don't have internet, let's just hide the notification count
      this.statusItem.hide();
    }
  }
}

exports.Notifications = Notifications;
