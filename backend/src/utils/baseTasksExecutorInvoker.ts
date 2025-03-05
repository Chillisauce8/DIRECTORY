var request = require("request-promise");
var privateSettings = require('../../privateSettings');


export abstract class BaseTasksExecutorInvoker {
    private deferMode: boolean = false;
    private needToInvoke: boolean = false;

    turnToDeferMode() {
        this.deferMode = true;
        this.needToInvoke = false;
    }

    turnToImmediateMode() {
        this.deferMode = false;

        if (this.needToInvoke) {
            this.invokeAsync();
        }

        this.needToInvoke = false;
    }

    public invokeAsync() {
        if (this.useDeferMode()) {
            if (this.deferMode) {
                this.needToInvoke = true;
                return;
            }
        }

        this.doInvokeCall();
    }

    protected useDeferMode() {
        return true;
    }

    protected doInvokeCall() {
        let baseUrl = privateSettings?.TASKS_SERVER_URL || privateSettings?.SERVER_URL || privateSettings?.SITE_URL;
        let request_options = {
            url: baseUrl + this.getInvokeUrl(),
            method: 'POST',
            auth: {
                user: privateSettings.SCHEDULER.username,
                pass: privateSettings.SCHEDULER.password,
            },
            timeout: this.getTimeOut()
        };

        setTimeout(() => {
            request(request_options)
                .then(result => {
                    // console.log(result);
                })
                .catch(result => {
                    console.log(result);
                });
        }, 5000);
    }

    protected abstract getInvokeUrl(): string;

    protected getTimeOut(): number {
        return 120000;
    }
}

