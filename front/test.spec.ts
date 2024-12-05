import { fixture, Selector } from "testcafe"


const commentText = 'Тестовый комментарий для автотестов'
fixture`D Экран "Комментарии"`
    .page`https://lk.nopaper.ru/`
    .beforeEach(async t => {
        await t
            .setNativeDialogHandler(() => true)
            .typeText("input[type='tel']", '')
            .typeText("input[type='password']", '')
            .click("button[type='submit']")
            .wait(10000)
    })

test('Отправка комментария физическим лицом', async t => {
    await t
        .click(Selector("button[type='button']").withText('Добавить'))
        .click(Selector('.context-item').withText('С контрагентом, клиентом или самозанятым'), { speed: 0.2 })
        .click('.comment-block__no-comments')
        .typeText("textarea[placeholder='Введите комментарий']", commentText)
        .click('.comment-modal__send-button')
        .expect(Selector('.comment-item__comment-text').innerText).contains('я ожидаю иувидеть это')
})