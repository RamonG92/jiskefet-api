/*
 * Copyright (C) 2018 Amsterdam University of Applied Sciences (AUAS)
 *
 * This software is distributed under the terms of the
 * GNU General Public Licence version 3 (GPL) version 3,
 * copied verbatim in the file "LICENSE"
 */

import { UserProfile } from '../abstracts/userprofile.abstract';

/**
 * Object received from GitHub when calling resource server for user info.
 * Endpoint: https://api.github.com/user
 */
export interface CernProfileDto extends UserProfile {
    name: string;
    username: string;
    id: number;
    personid: number;
    email: string;
    firstName: string;
    lastName: string;
    identityclass: string;
    federation: string;
    phone: string;
    mobile: string;
}
