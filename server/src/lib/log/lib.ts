import winston from 'winston';

const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.File({ filename: 'data/logs/logs.log' }),
    ],
});

export class LOGGER {
    static debug(d: string): void {
        try {
            logger.log({
                message: JSON.stringify(d),
                level: 'debug'
            });
        } catch (e) {
            logger.error(e)
        }
    }

    static info(d: unknown): void {
        try {
            logger.log({
                message: JSON.stringify(d),
                level: 'info'
            });
        } catch (e) {
            logger.error(e)
        }
    }

    static warn(d: unknown): void {
        try {
            logger.log({
                message: JSON.stringify(d),
                level: 'warn'
            });
        } catch (e) {
            logger.error(e)
        }
    }

    static error(d: unknown): void {
        try {
            logger.log({
                message: JSON.stringify(d),
                level: 'error'
            });
        } catch (e) {
            logger.error(e)
        }
    }
}
