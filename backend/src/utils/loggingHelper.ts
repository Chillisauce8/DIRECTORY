
export class LoggingHelper {
    toLog(data) {
        let error =  this.getErrorMessage(data);
        console.log(this.getTimeStamp() + ' ' + error);
    }

    toLogError(data) {
        const error =  this.getErrorMessage(data);

        console.log(this.getTimeStamp() + ' --------------- ERROR ---------------');
        console.log(error);
        console.log('-------------------------------------------------------');
    }

    getErrorMessage(data) {
        let error = data && data.error ? data.error : data;

        error = error && error.message ? error.message : error;

        if (typeof error !== 'string') {
            error = JSON.stringify(error);
        }

        return error || 'No message';
    }

    private getTimeStamp() {
        return (new Date()).toLocaleString();
    }
}

