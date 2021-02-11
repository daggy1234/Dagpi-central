create table application
(
    uu             uuid                                               not null
        constraint uu
            primary key,
    appname        varchar(255)                                       not null,
    appdescription varchar(255)                                       not null,
    appurl         varchar(255)                                       not null,
    appuserid      bigint                                             not null
        constraint appuserid
            unique,
    approved       boolean                                            not null,
    premium        boolean                                            not null,
    created_at     timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at     timestamp with time zone default CURRENT_TIMESTAMP not null
);

create table tokens
(
    userid     bigint                                             not null
        constraint userid
            primary key,
    apikey     varchar(64)                                        not null
        constraint apikey
            unique,
    totaluses  integer                                            not null,
    enhanced   boolean                                            not null,
    ratelimit  integer                                            not null ,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null
);