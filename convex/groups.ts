import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";

export const createGroup = mutation({
    args:{name:v.string(), description:v.string(), isDm:v.boolean(), email:v.string(), imgUrl:v.string()},

    handler:async(ctx,args) =>{
        const userId = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
        try {
            const groupId = await ctx.db.insert('groups', {
                 description:args.description,
                 name:args.name,
                 isDm:args.isDm,
                 owner: userId!._id,
                 avatar:args.imgUrl
            })
            return {data:{groupId:groupId},error:null}
        } catch (error) {
            console.error(error);
            return {data:null,error}
        }
    }
})

export const getGroupWithEmail = query({
    args:{email:v.optional(v.string())},
    handler: async (ctx, args) =>{
        if(!args.email) return;
        const userId = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
        try{
            const data = await ctx.db.query('groupchats').filter((q)=>q.eq(q.field('userId'), userId!._id)).collect()
            const af = [];
            for(let group in data){
                af.push(await ctx.db.get(data[group].groupId))
            }
            return {data:af, error:null};
        }catch(error){
            console.error(error);
            return {data:null, error}
        }
    }
})
export const getGroup = query({
    args:{groupId:v.id('groups')},
    handler: async(ctx,args) =>{
        try {
            const groupInfo = await ctx.db.get(args.groupId)
            const momo = await ctx.db.query('groupchats').filter((q)=>q.eq(q.field('groupId'), groupInfo!._id)).collect();
            let members:any = []
            for(let i = 0 ; i < momo.length ; i++){
                members.push(await ctx.db.get(momo[i].userId));
            }
            
            return {data:{groupInfo,members}, error:null}
        } catch (error) {
            console.error(error);
            return {data:null, error}
        }
    }
})
export const joinGroup = mutation({
    args:{groupId:v.id('groups'), email:v.string()},
    handler:async (ctx, args)=>{
        console.log(args.email)
        const userId = await ctx.db.query('users').filter((q)=>q.eq(q.field('email'), args.email)).first();
        console.log(userId)
        try {
            await ctx.db.insert('groupchats',{
                userId:userId!._id,
                groupId:args.groupId
            })    
            return {error:null}
        } catch (error) {
            console.error(error);
            return {error}
        }
    }
})