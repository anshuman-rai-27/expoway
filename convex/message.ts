import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";


export const getMessageByGroupId = query({
    args:{groupId:v.id("groups")},
    handler: async(ctx, args)=>{
        return await ctx.db.query('messages').filter((q)=>q.eq(q.field('groupId'), args.groupId)).collect();

    }
})

export const getDmMessage = query(
    {
        args:{fromUser:v.id("users"), toUser:v.id("users")},
        handler:async (ctx,args)=>{
            // from=id1&to=id2 || from=id2&to=id1
            const dm = await ctx.db.query('dm').filter((q)=>q.or(
                q.and(
                    q.eq(q.field('from'), args.fromUser), 
                    q.eq(q.field('to'), args.toUser)
                ),
                q.and(
                    q.eq(q.field('to'), args.fromUser),
                    q.eq(q.field('from'), args.toUser)
                )
            )).order('asc').collect();
            return dm;
        }
    }
)


export const createDmMessage = mutation({
    args:{fromUser:v.id('users'), toUser:v.id('users'), content:v.string(), isExpiry:v.optional(v.boolean()), isOneTime:v.optional(v.boolean())},
    handler:async (ctx,args) =>{
        await ctx.db.insert('dm',{
            from:args.fromUser,
            to:args.toUser,
            content:args.content,
            isEdited:false,
            isExpiry:args.isExpiry,
            isOneTime:args.isOneTime,
            seen:false,
        })
    }

})

export const getUploadUrl = action({
    args:{},
    handler:async (ctx,args)=>{
        return await ctx.storage.generateUploadUrl()
    }
})

export const getUrluploadFile = action({
    args:{storageId:v.id('_storage')},
    handler:async (ctx,args)=>{
        const storageUrl = await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
        console.log(storageUrl)
        return storageUrl;
    }
})

export const createMessage = mutation({
    args:{content:v.string(), groupId:v.id('groups'), from:v.id('users'), isExpiry:v.optional(v.boolean()), isOneTime:v.optional(v.boolean())},
    handler:async (ctx,args)=>{
        const messageId = await ctx.db.insert('messages', {
            from:args.from,
            content:args.content,
            groupId:args.groupId,
            seen:false,
            isExpiry:args.isExpiry,
            isOneTime:args.isOneTime,
            isEdited:false
        })
        if(args.isExpiry){
            await ctx.scheduler.runAfter(5000,internal.message.markExpiryMessage, {
                messageId
            })
        }
        
    }
})

export const editMessage = mutation({
    args:{messageId:v.id('messages'), content:v.string()},
    handler: async (ctx,args)=>{
        await ctx.db.patch(args.messageId, {
            isEdited:true,
            content:args.content
        })
    }
})

export const markExpiryMessage = internalMutation({
    args:{messageId:v.id('messages')},
    handler:async (ctx, args) =>{
        console.log('messageId',args.messageId)
        await ctx.db.patch(args.messageId, {
            content:"This message is Expired"
        })
    }
})


// export const getMessageByGroupId = query({
//     args: { groupId: v.id('groups') },
//     handler: async (ctx, args) => {
//         return await ctx.table('messages').filter((q) => q.eq(q.field('groupId'), args.groupId));
//     }
// })


// export const createMessage = mutation({
//     args: { content: v.string(), from: v.id('users'), groupId: v.id('groups') },
//     handler: async (ctx, args) => {
//         try {
//             await ctx.table('messages').insert({
//                 from: args.from,
//                 content: args.content,
//                 groupId: args.groupId
//             })
//             return { error: null }
//         } catch (error) {
//             return { error };
//         }
//     }
// })
