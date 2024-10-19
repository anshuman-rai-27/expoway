import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createCallLog = mutation(
    {
        args: { from: v.id('users'), to: v.id('users') },
        handler: async (ctx, args) => {
            const calllog = await ctx.db.query('callLogs').filter((q)=>q.or(
                q.and(
                    q.eq(q.field('from'), args.from), q.eq(q.field('to'), args.to)
                ),
                q.and(
                    q.eq(q.field('to'), args.from), q.eq(q.field('from'), args.to)
                )
            )).filter((q)=>q.eq(q.field('status'), 'ONGOING')).first();
            if(calllog){
                return calllog._id;
            }
            const id = await ctx.db.insert('callLogs', {
                from: args.from,
                to: args.to,
                status: "ONGOING"
            })
            return id
        }
    }
)


export const updateCallLog = mutation({
    args: { callLogId: v.id('callLogs'), status: v.union(v.literal('COMPLETED'), v.literal('ONGOING')) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.callLogId, {
            status: args.status
        })
    }
})