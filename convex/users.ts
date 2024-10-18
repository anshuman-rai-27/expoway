import { v } from "convex/values"
import { action, mutation, query, internalAction } from "./_generated/server"
import { api, internal } from "./_generated/api";


export const getUser = query({
    args:{email:v.string()},
    handler:async (ctx, args)=>{
        return await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
    }
})

export const getAllUser = query({
    args:{},
    handler:async (ctx,args)=>{
        return await ctx.db.query('users').collect();
    }
})

export const getAllUserWithPublicKey = query({
    args:{},
    handler: async (ctx,args)=>{
        const users = await ctx.db.query('users').collect();
        const usersWithPKey = []
        for(let i= 0 ; i < users.length ; i++){
            const publicKey = await ctx.db.query('userPublicKey').filter((q)=>q.eq(q.field('user'), users[i]._id)).first();
            usersWithPKey.push({...users[i], publicKey:publicKey?.publicKey});
        }
        return usersWithPKey;
    }
})

export const getUserByUserId = query({
    args:{userId:v.id('users')},
    handler:async(ctx,args)=>{
        return await ctx.db.get(args.userId);
    }
})

export const removeGroupMember = mutation({
    args:{groupId:v.id('groups'), userId:v.id('users')},
    handler: async (ctx, args) =>{
        const groupConnection = await ctx.db.query('groupchats').filter((q)=>q.eq(q.field('groupId'), args.groupId)).filter((q)=>q.eq(q.field('userId'), args.userId)).first();
        if(groupConnection)
            await ctx.db.delete(groupConnection._id);
    }
})


export const removeFriendShip = mutation({
    args:{from:v.id('users'), to:v.id('users')},
    handler:async (ctx,args)=>{
        const friend = await ctx.db.query('friend').filter((q)=>q.and(q.eq(q.field('from'), args.from), q.eq(q.field('to'), args.to))).first();
        if(friend)
            await ctx.db.delete(friend._id);
    }
})

export const getFriendShip = query({
    args:{fromEmail:v.string()},
    handler:async(ctx,args)=>{
        const user = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.fromEmail)).first()
        if(!user){
            console.error("User doesn't exist")
            return;
        }
        const friendships = await ctx.db.query('friend').filter((q)=>q.eq(q.field('from'), user._id)).collect();
        const users = [];
        for(let i = 0 ; i < friendships.length ; i++){
            const friend = await ctx.db.get(friendships[i].to);
            users.push(friend)
        }
        return users;
    }
})

export const createFriendship = mutation({
    args:{from:v.id('users'), to:v.id('users')},
    handler: async(ctx,args)=>{
        const friendship = await ctx.db.query('friend').filter((q)=>q.or(
            q.and(
                q.eq(q.field('from'), args.from), 
                q.eq(q.field('to'), args.to),
            ),
            q.and(
                q.eq(q.field('to'), args.from),
                q.eq(q.field('from'), args.to),
            ),
        )).collect()
        
        if(friendship.length) return;
        const friendship1 = await ctx.db.query('friend').filter((q)=>q.and(q.eq(q.field('from'),args.from),q.eq(q.field('to'),args.to))).collect()
        if(!friendship1.length)
        await ctx.db.insert('friend',{
            from:args.from,
            to:args.to
        })
        const friendship2 = await ctx.db.query('friend').filter((q)=>q.and(q.eq(q.field('from'),args.to),q.eq(q.field('to'),args.from))).collect()
        if(!friendship2.length)
        await ctx.db.insert('friend',{
            from:args.to,
            to:args.from
        })

    }
})


export const createVerificationCode = mutation({
    args:{email:v.string(), code:v.string(),type:v.union(v.literal("signIn"), v.literal('signUp'))},
    handler:async (ctx,args)=>{
        await ctx.db.insert('verification',{
            email:args.email,
            code: args.code,
            type:args.type
        })
    }
})

export const updateUser = mutation({
    args:{email:v.string(), imgUrl:v.optional(v.string()), name:v.optional(v.string()), phone:v.optional(v.string())},
    handler:async(ctx,args)=>{
        const user = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
        await ctx.db.patch(user!._id, {
            name:args.name,
            phone:args.phone,
            image:args.imgUrl
        })
    }
})

export const sendEmail = action({
    args:{email:v.string(), type:v.union(v.literal("signIn"), v.literal('signUp'))},
    handler:async (ctx,args)=>{
        const code = Math.floor(100000 + Math.random() * 900000);
        
        await ctx.runMutation(api.users.createVerificationCode,{email:args.email, code:code.toString(), type:args.type})

        console.log(process.env.RESEND_API, 'Env')
        try{
        const response = await fetch(`https://api.resend.com/emails`,{
            method:"POST",
            headers:{
                'Authorization':`Bearer ${process.env.RESEND_API}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                from:process.env.RESEND_EMAIL,
                to:args.email,
                subject: `Verification Code for ${args.type[0].toUpperCase()}${args.type.substring(1)}`,
                text:`Code:${code.toString()}`
            })
        })
        console.log(response)
        }catch(error){
            console.error(error)
        }
    }
})

export const checkVerificationCode = mutation({
    args:{email:v.string(), code:v.string(), type:v.union(v.literal("signIn"), v.literal('signUp'))},
    handler:async (ctx,args) =>{
        const codeDetail = await ctx.db.query('verification').filter((q)=>q.eq(q.field('email'), args.email)).order('desc').first();
        if(!codeDetail){
            console.log("Doesn't exist")
            return;
        }
        if(args.code.localeCompare(codeDetail.code)!==0){
            console.log("Mismatch")
            return;
        }
        await ctx.db.delete(codeDetail._id);
        return {message:"Success"};
    }
})



export const setPublicKey = mutation({
    args:{email:v.string(), publicKey:v.string()},
    handler:async(ctx,args)=>{
        const userInfo = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
        await ctx.db.insert('userPublicKey',{
            publicKey:args.publicKey,
            user:userInfo!._id
        })
        return args.publicKey
    }
})

export const getPublicKey = mutation({
    args:{email:v.string()},
    handler:async(ctx,args)=>{
        const userInfo = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
        const publicKey = await ctx.db.query('userPublicKey').filter((q)=>q.eq(q.field('user'), userInfo!._id)).first();
        return publicKey!.publicKey
    }
})
