const request = require('request-promise');


export abstract class BaseTasksExecutorInvoker {

    private deferMode = false;
    private needToInvoke = false;

    constructor(
        protected SERVER_URL: string,
        protected SCHEDULER_TASKS_PARAMS: any
    ) {
        //
    }

    turnToDeferMode(req: Request) {
        this.deferMode = true;
        this.needToInvoke = false;
    }

    turnToImmediateMode(req: Request) {
      this.deferMode = false;

        if (this.needToInvoke) {
            this.invokeAsync(req);
        }

      this.needToInvoke = false;
    }

    public async invokeAsync(req: Request) {

        if (this.deferMode) {
          this.needToInvoke = true;
          return;
        }

        await this.doInvokeCall(req);
    }

    protected prepareInvokeHeaders(req: Request) {
        return {
            'Origin': req['origin'],
        }
    }

    protected async doInvokeCall(req: Request) {

        const request_options = {
            url: this.SERVER_URL + this.getInvokeUrl(),
            method: 'POST',
            auth: {
                user: this.SCHEDULER_TASKS_PARAMS.username,
                pass: this.SCHEDULER_TASKS_PARAMS.password,
            },
            timeout: this.getTimeOut(),
            headers: this.prepareInvokeHeaders(req),
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

