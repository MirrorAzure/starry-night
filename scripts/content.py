"""Compile editable rules into static HTML. No runtime dependencies or build needed to host."""
from pathlib import Path
import re,html
root=Path(__file__).resolve().parent.parent

def inline(s):
 return re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',html.escape(s.strip()))
def markdown(s):
 out=[]
 for block in re.split(r'\n\s*\n',s.strip()):
  lines=block.strip().splitlines()
  if all(line.startswith('- ') for line in lines):out.append('<ul>'+''.join('<li>'+inline(line[2:])+'</li>' for line in lines)+'</ul>')
  elif re.match(r'^#+ ',block):out.append('<h4>'+inline(re.sub(r'^#+\s*','',block))+'</h4>')
  else:out.append('<p>'+inline(' '.join(lines))+'</p>')
 return '\n'.join(out)
def chapters(file,prefix):
 s=(root/'content'/file).read_text()
 matches=list(re.finditer(r'^#{1,3} ([1-6]\. [^\n]+)$',s,re.M))
 details=[];links=[]
 for i,m in enumerate(matches):
  title=m.group(1).strip();ident=f'{prefix}-{i+1}'
  body=s[m.end():matches[i+1].start() if i+1<len(matches) else len(s)]
  details.append(f'<details class="rule-chapter" id="{ident}"><summary>{inline(title)}<span aria-hidden="true">+</span></summary><div class="rule-copy">{markdown(body)}</div></details>')
  links.append(f'<a href="#{ident}" data-rule-link>{inline(title)}</a>')
 return '\n'.join(details),'\n'.join(links)
mods,modnav=chapters('mod-rules.md','mod-rule');game,gamenav=chapters('game-rules.md','game-rule')
content='''<div class="tabs" role="tablist" aria-label="Информация о сервере">
<button id="tab-about" role="tab" aria-selected="true" aria-controls="about" tabindex="0"><span>01</span> О сервере</button>
<button id="tab-access" role="tab" aria-selected="false" aria-controls="access" tabindex="-1"><span>02</span> Проходка</button>
<button id="tab-rules" role="tab" aria-selected="false" aria-controls="rules" tabindex="-1"><span>03</span> Правила сервера</button></div>
<div id="about" class="panel" role="tabpanel" aria-labelledby="tab-about" tabindex="0">
<p class="eyebrow">ОДИН МИР · БЕСКОНЕЧНАЯ ИСТОРИЯ</p>
<div class="about-intro"><h2>Starry Night —<br><span>мир, который не имеет конца</span></h2><div class="about-copy"><p>Starry Night — Vanilla+ сервер Minecraft на лицензионной Java Edition с актуальной версией игры, созданный для творчества, исследования и бесконечного выживания без вайпов.</p><p>Сервер развивается сезонами. Между ними проводятся технические работы, оптимизация мира, обновление и разработка новых датапаков.</p></div></div>
<p class="about-motto">Создавайте, исследуйте, мемасьте!<br><span>Запечатлите свой кубический след!</span></p>
<section class="members"><div class="members-heading"><div><p class="eyebrow">ТЕ, КТО СОЗДАЁТ ЭТОТ МИР</p><h3>Участники сервера</h3></div><p id="members-updated" hidden></p></div><div id="members-list" class="members-grid"></div><p id="members-empty" class="empty-note">Здесь скоро появятся участники Starry Night и их время в игре.</p></section>
</div>
<div id="access" class="panel" role="tabpanel" aria-labelledby="tab-access" tabindex="0" hidden>
<p class="eyebrow">ДОБРО ПОЖАЛОВАТЬ В ЗВЁЗДНУЮ НОЧЬ</p><h2>Проходка</h2><div class="access-intro"><p>На Starry Night можно попасть одним из трёх способов. Каждый сезон вам нужно актуализировать доступ к серверу.</p><p>Концепция без вайпов подразумевает вечно нарастающую надобность в вычислительных мощностях, поэтому информация о проходке может меняться в зависимости от сезона.</p></div>
<div class="access-options"><article><p class="number">СПОСОБ 01</p><h3>100к баллов</h3><p>Вы можете получить проходку на любом канале за баллы, чей автор является доверенным лицом сервера.</p><div id="trusted-channels" class="channel-links"><span class="pending-note">Список каналов появится здесь.</span></div></article>
<article><p class="number">СПОСОБ 02</p><h3>Приобрести проходку</h3><p>Вы можете купить проходку на каналах-партнёрах.</p><div id="partner-channels" class="channel-links"><span class="pending-note">Каналы-партнёры будут добавлены.</span></div></article>
<article><p class="number">СПОСОБ 03</p><h3>Получить приглашение</h3><p>Вы можете заполнить форму и получить приглашение. В форме вы можете указать ваши творческие успехи, указать, являетесь ли вы автором контента, и описать ваше отношение к Minecraft. Расскажите о себе!</p><a id="application-link" class="application-link" hidden>Заполнить форму <span aria-hidden="true">↗</span></a><span class="pending-note" id="application-pending">Ссылка на форму скоро появится.</span></article></div></div>
<div id="rules" class="panel" role="tabpanel" aria-labelledby="tab-rules" tabindex="0" hidden><p class="eyebrow">БЕРЕЖЁМ МИР, УВАЖАЕМ ДРУГ ДРУГА</p><div class="rules-heading"><h2>Правила сервера</h2><button type="button" class="rules-toggle" id="rules-toggle">Развернуть все главы</button></div>
<div class="rules-layout"><nav class="rules-nav" aria-label="Оглавление правил"><p>МОДИФИКАЦИИ</p>'''+modnav+'''<p>ПРАВИЛА ИГРЫ</p>'''+gamenav+'''</nav><div class="rules-body"><section aria-labelledby="mods-title"><h3 class="rules-group-title" id="mods-title">Правила использования модификаций на сервере Minecraft</h3>'''+mods+'''</section><section aria-labelledby="game-title"><h3 class="rules-group-title" id="game-title">Правила игры</h3><p class="rules-subtitle">Основные правила сервера и положения игрового мира</p>'''+game+'''</section></div></div></div>
'''
p=(root/'dist/index.html') if (root/'dist/index.html').exists() else (root/'index.html');s=p.read_text();start=s.index('<div class="tabs"');end=s.index('<div class="join">',start);p.write_text(s[:start]+content+s[end:])
