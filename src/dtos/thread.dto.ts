import { ApiModelProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

/*
 * Copyright (C) 2018 Amsterdam University of Applied Sciences (AUAS)
 *
 * This software is distributed under the terms of the
 * GNU General Public Licence version 3 (GPL) version 3,
 * copied verbatim in the file "LICENSE"
 */

/**
 * User to create based on the authentication via OAuth 2.
 * The app only saves the external (OAuth provider) ID and no additional information
 * in order to prevent redundancy.
 */
export class ThreadDto {
    @ApiModelProperty({
        description: 'log_id'
    })
    logId: number;
    @ApiModelProperty({
        description: 'The id of the run\'s log id'
    })
    commentFkRootLogId: number;

    @ApiModelProperty({
        description: 'The id of the comment on a thread'
    })
    commentFkParentLogId: number;

    @ApiModelProperty({
        description: 'Date and Time when the comment was created'
    })
    creationTime: Date;

    @ApiModelProperty({
        description: 'Title of the comment'
    })
    title: string;

    @ApiModelProperty({
        description: 'Content of the comment'
    })
    text: string;

    @ApiModelProperty({
        description: 'user'
    })
    user: User;

    @ApiModelProperty({
        description: ''
    })
    comments: ThreadDto[];

    constructor(data: ThreadDto | {} = {}) {
        Object.assign(this, data);
    }
}
