import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,
    userPublicKey:defineTable({
        publicKey:v.string(),
        user:v.id('users')
    }),
    groupchats:defineTable({
        userId:v.id('users'),
        groupId:v.id('groups')
    }),
    messages:defineTable({
        from:v.id('users'),
        content:v.string(),
        groupId:v.id('groups'),
        isOneTime:v.optional(v.boolean()),
        isExpiry:v.optional(v.boolean()),
        isEdited:v.optional(v.boolean()),
        seen:v.optional(v.boolean()),
    }),
    friend:defineTable({
        from:v.id('users'),
        to:v.id('users')
    }),
    dm:defineTable({
        from:v.id('users'),
        to:v.id('users'),
        content:v.string(),
        isOneTime:v.optional(v.boolean()),
        isExpiry:v.optional(v.boolean()),
        isEdited:v.optional(v.boolean()),
        seen:v.optional(v.boolean())
    }),
    callLogs:defineTable({
        from:v.id('users'),
        to:v.id('users'),
        status:v.union(v.literal('ONGOING'), v.literal('COMPLETED'))
    }),
    verification:defineTable({
        email:v.string(),
        type:v.union(v.literal('signIn'), v.literal('signUp')),
        code:v.string()
    }),
    sessions:defineTable({
        type:v.union(v.literal('TEMPORARY'), v.literal('PERMANENT')),
        secret:v.string(),
        userId:v.string(),
        code:v.optional(v.string())
    }),
    groups:defineTable({
        name:v.string(),
        description:v.string(),
        isDm:v.boolean(),
        owner:v.id('users'),
        avatar:v.optional(v.string()),
        expiry:v.optional(v.string()),
        isExpiry:v.optional(v.boolean())
    })
})
export default schema;

// import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
// import { v } from "convex/values";

// const schema = defineEntSchema({
//     users:defineEnt({
//         publicKey:v.string(),
//         password:v.string(),
//     }).field('email', v.string(), {unique:true}).edge('session').edges('group', {to:'groups', table:"groupchat"}).edge('profile'),

//     profiles:defineEnt({
//         name:v.string(),
//         description: v.string(),
//     }).edge('user'),
//     messages:defineEnt({
//         from:v.id('users'),
//         content:v.string()
//     }).edge('group'),

//     sessions:defineEnt({
//         deviceId:v.string(),
//     }).edge('user'),

//     groups: defineEnt({
//         name:v.string(),
//         description:v.string(),
//         isDm:v.boolean(),
//         owner:v.optional(v.id('users'))
//     }).edge('message').edges('user', {to:'users', table:"groupchat"})
// })

// export default schema;

// export const entDefinitions = getEntDefinitions(schema); 

