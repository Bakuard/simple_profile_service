import {createLogger, format, transports} from 'winston';
import dailyRotateFile from 'winston-daily-rotate-file';

function newLogger(level, fileName, microserviceName) {
    return createLogger({
        level: level,
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        ),
        defaultMeta: {
            fileName: fileName,
            microserviceName: microserviceName
        },
        transports: [
            new transports.Console(),
            new transports.DailyRotateFile({
                level: 'info',
                filename: './logs/log-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '20',
                auditFile: './logs/auditFileForWork.json'
            })
        ]
    });
}

export default newLogger;