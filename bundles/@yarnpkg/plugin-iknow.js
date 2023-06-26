/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-iknow",
factory: function (require) {
var plugin=(()=>{var f=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var E=Object.getOwnPropertyNames;var S=Object.prototype.hasOwnProperty;var i=(r=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(r,{get:(t,s)=>(typeof require<"u"?require:t)[s]}):r)(function(r){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+r+'" is not supported')});var v=(r,t)=>{for(var s in t)f(r,s,{get:t[s],enumerable:!0})},N=(r,t,s,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of E(t))!S.call(r,o)&&o!==s&&f(r,o,{get:()=>t[o],enumerable:!(n=k(t,o))||n.enumerable});return r};var A=r=>N(f({},"__esModule",{value:!0}),r);var I={};v(I,{default:()=>D});var u=i("@yarnpkg/cli"),h=i("clipanion"),e=i("@yarnpkg/core"),m=i("@yarnpkg/plugin-essentials"),y=/[0-9]-canary-/,c=class extends u.BaseCommand{async execute(){let t=await e.Configuration.find(this.context.cwd,this.context.plugins),{project:s}=await e.Project.find(t,this.context.cwd);return(await e.StreamReport.start({configuration:t,stdout:this.context.stdout},async o=>{for(let a of s.workspaces){let x=`package.json for ${e.structUtils.prettyWorkspace(t,a)} contains `,g=w=>{for(let l of w)y.test(l.range)&&o.reportError(e.MessageName.UNNAMED,`${x}${e.structUtils.prettyDescriptor(t,l)}`)};g(a.manifest.dependencies.values()),g(a.manifest.devDependencies.values())}for(let a of s.originalPackages.values())y.test(a.reference)&&o.reportError(e.MessageName.UNNAMED,`yarn.lock contains ${e.structUtils.prettyLocator(t,a)}`)})).exitCode()}};c.paths=[["check-canary"]];var d=class extends u.BaseCommand{async execute(){let t=await e.Configuration.find(this.context.cwd,this.context.plugins);return await this.cli.run(["dedupe","--check","--strategy",t.get("dedupeStrategy")])}};d.paths=[["check-dupes"]];var p=class extends u.BaseCommand{constructor(){super(...arguments);this.args=h.Option.Proxy()}async execute(){let s=await e.Configuration.find(this.context.cwd,this.context.plugins);return await this.cli.run(["dedupe","--strategy",s.get("dedupeStrategy"),...this.args])}};p.paths=[["fix-dupes"]];var P=async({configuration:r,cwd:t},{report:s,cache:n})=>{if(process.env.SKIP_DEDUPE_CHECK)return;let{project:o}=await e.Project.find(r,t);await m.dedupeUtils.dedupe(o,{patterns:[],report:s,cache:n,strategy:r.get("dedupeStrategy")})>0&&s.reportError(e.MessageName.UNNAMED,"Run `yarn fix-dupes` to remove duplicates")},U={commands:[c,d,p],hooks:{afterAllInstalled:P},configuration:{dedupeStrategy:{description:"The dedupe strategy to use",type:e.SettingsType.STRING,default:"highest"}}},D=U;return A(I);})();
return plugin;
}
};
