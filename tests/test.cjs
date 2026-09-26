const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');
const root=path.resolve(__dirname,'..')+path.sep;
const manifest=JSON.parse(fs.readFileSync(root+'manifest.json','utf8'));
assert.strictEqual(manifest.manifest_version,3);
assert.deepStrictEqual(manifest.permissions,['clipboardRead','clipboardWrite']);
assert(!('host_permissions' in manifest));
const code=fs.readFileSync(root+'cleaner.js','utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(code+';globalThis.clean=MagnetCleaner.clean;',ctx);
const base='magnet:?xt=urn:btih:58e4d9ce4fb5d539e827051e39e931391b1fb0a4';
const tr='http://tracker.example:8888/announce';
const cases=[
 [base,base],
 [`[${base}&dn=savr-1053](${base}&dn=savr-1053)`,base+'&dn=savr-1053'],
 [base+'&dn=savr-1053&xl=10560181588&tr=['+tr+'&amp;tr=udp://tracker.example:6969/announce]('+tr+'\\&amp;tr=udp://tracker.example:6969/announce)',base+'&dn=savr-1053&xl=10560181588&tr='+tr+'&tr=udp://tracker.example:6969/announce'],
 [base+'&amp;amp;dn=测试&amp;tr='+tr+'&amp;tr='+tr,base+'&dn=%E6%B5%8B%E8%AF%95&tr='+tr],
 [base+'&dn=film (2026)',base+'&dn=film%20(2026)'],
 [base+'&dn=%5Bname%5D&x=a%26b&x=other',base+'&dn=%5Bname%5D&x=a%26b&x=other'],
 [base+'\\&amp;tr=\\['+tr+'\\]',base+'&tr='+tr],
 [base+'&tr='+tr+'&tr='+tr,base+'&tr='+tr]
];
for(const [input,expected]of cases)assert.strictEqual(ctx.clean(input).uri,expected);
assert.strictEqual(ctx.clean(base+'&tr='+tr+'&tr='+tr).duplicates,1);
assert.throws(()=>ctx.clean('ordinary copied text'));
assert.throws(()=>ctx.clean('magnet:?dn=no-hash'));
// Simulate a copy event containing ordinary text. No panel may be created.
let handler,appendCount=0;
const fake={document:{addEventListener:(type,fn)=>{if(type==='copy')handler=fn;},activeElement:null,documentElement:{append:()=>appendCount++}},window:{getSelection:()=>({toString:()=>''})},navigator:{clipboard:{readText:async()=> 'ordinary copied text'}},setTimeout:(fn)=>Promise.resolve().then(fn)};
vm.createContext(fake);vm.runInContext(code+'\n'+fs.readFileSync(root+'content.js','utf8'),fake);
handler({target:{},clipboardData:{getData:()=>''}});
setTimeout(()=>{assert.strictEqual(appendCount,0);console.log(`${cases.length} cleaning cases, invalid inputs, ordinary-copy silence and MV3 manifest passed.`);},10);
