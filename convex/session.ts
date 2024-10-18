import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server"
import { api } from "./_generated/api";

export const createSession = mutation({
    args:{email:v.string(), secret:v.string()},
    handler: async (ctx,args)=>{
        const user = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
        if(!user) return;
        const sessionId = await ctx.db.insert('sessions',{
            userId:user._id,
            secret:args.secret,
            type:"PERMANENT"
        })
        return sessionId;
    }
})

export const createTempSession = mutation({
    args:{userId:v.id('users'), secret:v.string(), code:v.string()},
    handler:async (ctx,args) =>{
        return await ctx.db.insert('sessions',{
            secret:args.secret,
            type:'TEMPORARY',
            userId:args.userId,
            code:args.code
        });
    }
})

export const getSession = query({
    args:{userId:v.optional(v.id('users'))},
    handler:async (ctx,args)=>{
        if(args.userId)
            return await ctx.db.query('sessions').filter((q)=>q.eq(q.field('userId'), args.userId)).filter((q)=>q.eq(q.field('type'),"PERMANENT")).collect();
    }
})

export const getSessionById = query({
    args:{sessionId:v.optional(v.id('sessions'))},
    handler:async (ctx,args)=>{
        if(args.sessionId)
            return await ctx.db.get(args.sessionId);
    }
})

export const updateTempSession = mutation({
    args:{sessionId:v.id('sessions'), secret:v.optional(v.string()), code:v.optional(v.string()), type:v.optional(v.union(v.literal('PERMANENT'), v.literal('TEMPORARY')))},
    handler:async (ctx,args)=>{
        await ctx.db.patch(args.sessionId,{
            secret:args.secret,
            code:args.code,
            type:args.type,
        })    
        return;
    }
})

export const removeSession = mutation({
    args:{sessionId:v.id('sessions')},
    handler:async (ctx,args)=>{
        await ctx.db.delete(args.sessionId);
    }
})

export const verifyTempSession = mutation({
    args:{userId:v.id('users'), code:v.string()},
    handler: async (ctx,args)=>{
        const tempsession = await ctx.db.query('sessions').filter((q)=>q.eq(q.field('userId'), args.userId)).filter((q)=>q.eq(q.field('type'), "TEMPORARY")).first();
        if(!tempsession) return;
        if(tempsession.code && tempsession.code === args.code){
            return {data:{sessionId:tempsession._id,secret:tempsession.secret}, error:null}
        }
        return {data:null, error:"Wrong Code"}
    }
})
