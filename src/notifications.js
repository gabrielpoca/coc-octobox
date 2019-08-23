const child_process = require("child_process");

class Notifications {
  constructor(axios, workspace, nvim) {
    this.name = "octobox";
    this.description = "octobox notifications list";
    this.defaultAction = "open";
    this.actions = [];
    this.axios = axios;
    this.nvim = nvim;
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
    const result = await this.axios.get("notifications.json?per_page=100");

    return result.data.notifications
      .filter(({ archived }) => !archived)
      .map(notif => ({ ...notif, updated_at: new Date(notif.updated_at) }))
      .sort(({ updated_at }) => updated_at)
      .map(notif => {
        console.log(notif);
        return { label: this.buildLabel(notif), data: notif };
      });
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
}

exports.Notifications = Notifications;
