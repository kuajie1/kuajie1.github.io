// 小说语料索引：7 本正典的结构化 JSON（由 build_corpus.py 从 epub 生成）。
// 每本：{ id, title, type, source, chapters:[{id,index,title,en,zh:null}] }
// en 为 HTML 字符串；zh 为 null 时阅读器显示「翻译待补充」。
import junior from './junior.json'
import junior2 from './junior2.json'
import conceal from './conceal.json'
import dangerous from './dangerous.json'
import forest from './forest.json'
import polar from './polar.json'
import allfound from './allfound.json'

export const novelData = {
  junior,
  junior2,
  conceal,
  dangerous,
  forest,
  polar,
  allfound,
}

export const novelOrder = [
  'junior',
  'junior2',
  'conceal',
  'dangerous',
  'forest',
  'polar',
  'allfound',
]
