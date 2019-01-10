/*
 * Copyright (C) 2018 Amsterdam University of Applied Sciences (AUAS)
 *
 * This software is distributed under the terms of the
 * GNU General Public Licence version 3 (GPL) version 3,
 * copied verbatim in the file "LICENSE"
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { InfoLogService } from './services/infolog.service';
import * as cron from 'node-cron';
import { EnvironmentUtility } from './utility/env.utility';

/**
 * Check the .env against the array of variables.
 * if one of the variables is missing, the program will exit.
 */
function preCheck(): void {
    const envUtil = new EnvironmentUtility();
    const keys: string[] = [
        'PORT',
        'USE_API_PREFIX',
        'USE_CERN_SSO',
        'TYPEORM_CONNECTION',
        'TYPEORM_HOST',
        'TYPEORM_USERNAME',
        'TYPEORM_PASSWORD',
        'TYPEORM_DATABASE',
        'TYPEORM_PORT',
        'TYPEORM_SYNCHRONIZE',
        'TYPEORM_LOGGING',
        'TYPEORM_ENTITIES',
        'TYPEORM_MIGRATIONS',
        'TYPEORM_MIGRATIONS_DIR',
        'JWT_SECRET_KEY',
        'JWT_EXPIRE_TIME',
        'SUB_SYSTEM_TOKEN_EXPIRES_IN',
        'USE_INFO_LOGGER'
    ];

    // for url regex, see https://regexr.com/3ajfi
    let values: string[] = [
        // need to limit range of allowed ports from 1 - 65535
        'regex:^([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-9][0-9][0-9][0-9][0-9])$',
        // expected values
        'string:true, false',
        'string:true, false',
        '',
        '',
        '',
        '',
        '',
        'regex:^([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-9][0-9][0-9][0-9][0-9])$',
        'string:true, false',
        'string:true, false',
        '',
        '',
        '',
        '',
        '',
        '',
        'string:true, false'
    ];

    envUtil.checkEnv(keys);

    if (process.env.USE_CERN_SSO === 'true') {
        envUtil.checkEnv([
            'CERN_CLIENT_ID',
            'CERN_CLIENT_SECRET',
            'CERN_AUTH_TOKEN_HOST',
            'CERN_AUTH_TOKEN_PATH',
            'CERN_RESOURCE_API_URL',
            'CERN_AUTH_URL'
        ]);

        envUtil.checkEnvPlaceholders('CERN_AUTH_URL', 'CLIENT_ID_HERE');
    } else {
        envUtil.checkEnv([
            'GITHUB_CLIENT_ID',
            'GITHUB_CLIENT_SECRET',
            'GITHUB_AUTH_TOKEN_HOST',
            'GITHUB_AUTH_TOKEN_PATH',
            'GITHUB_RESOURCE_API_URL',
            'GITHUB_AUTH_URL'
        ]);

        envUtil.checkEnvPlaceholders('GITHUB_AUTH_URL', 'CLIENT_ID_HERE');
    }
}

preCheck();

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    // Increases the packet limit to 15MB instead of the default 100kb
    app.use(bodyParser.json({ limit: 15000000 }));
    app.use(bodyParser.urlencoded({ limit: 15000000, extended: true }));

    const options = new DocumentBuilder()
        .setTitle('Jiskefet')
        .setVersion('0.1.0')
        .addTag('logs')
        .addTag('runs')
        .addBearerAuth();

    if (process.env.USE_API_PREFIX === 'true') {
        // set /api as basePath for non local
        options.setBasePath('/api');
        options.setDescription('Running with /api prefix');
    } else {
        options.setDescription('Running without /api prefix');
    }

    const document = SwaggerModule.createDocument(app, options.build());
    SwaggerModule.setup('doc', app, document);

    if (process.env.USE_INFO_LOGGER === 'true') {
        app.useLogger(app.get(InfoLogService));

        // Periodically save InfoLogs that failed to be persisted to the db.
        cron.schedule('*/15 * * * *', () => {
            app.get(InfoLogService).saveUnsavedInfologs();
        });
    }

    await app.listen(process.env.PORT);
}
bootstrap();
