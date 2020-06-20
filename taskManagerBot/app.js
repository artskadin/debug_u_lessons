import express from 'express'
import { PORT, TOKEN } from './config.js'
import Telegraf from 'telegraf'
import session from 'telegraf/session.js'
import { getMainMenu, yesNoKeyboard } from './keyboards.js'
import { getMyTasks, addTask, deleteTask } from './db.js'

const app = express()
const bot = new Telegraf(TOKEN)

bot.use(session())

bot.start(ctx => {
    ctx.replyWithHTML(
        'Приветсвую в <b>TaskManagerBot</b>\n\n'+
        'Чтобы быстро добавить задачу, просто напишите ее и отправьте боту',
        getMainMenu())
})

bot.hears('Мои задачи', async ctx => {
    const tasks = await getMyTasks()
    let result = ''

    for (let i = 0; i < tasks.length; i++) {
        result = result + `[${i+1}] ${tasks[i]}\n`
    }

    ctx.replyWithHTML(
        '<b>Список ваших задач:</b>\n\n'+
        `${result}`
    )
})

bot.hears('Удалить задачу', ctx => {
    ctx.replyWithHTML(
        'Введите фразу <i>"удалить `порядковый номер задачи`"</i>, чтобы удалить сообщение,'+
        'например, <b>"удалить 3"</b>:'
    )
})

bot.hears(/^удалить\s(\d+)$/, ctx => {
    const id = Number(+/\d+/.exec(ctx.message.text)) - 1
    deleteTask(id)
    ctx.reply('Ваша задача успешно удалена')
})

bot.hears('Смотивируй меня', ctx => {
    ctx.replyWithPhoto(
        'https://img2.goodfon.ru/wallpaper/nbig/7/ec/justdoit-dzhastduit-motivaciya.jpg',
        {
            caption: 'Не вздумай сдаваться!'
        }
    )
})

bot.on('text', ctx => {
    ctx.session.taskText = ctx.message.text

    ctx.replyWithHTML(
        `Вы действительно хотите добавить задачу:\n\n`+
        `<i>${ctx.message.text}</i>`,
        yesNoKeyboard()
    )
})

bot.action(['yes', 'no'], ctx => {
    if (ctx.callbackQuery.data === 'yes') {
        addTask(ctx.session.taskText)
        ctx.editMessageText('Ваша задача успешно добавлена')
    } else {
        ctx.deleteMessage()
    }
})

bot.launch()
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))
