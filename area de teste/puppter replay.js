const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 899,
            height: 607
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://selecty.app/curriculum/create-cv/complete/0');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.col-1 label.active'),
            targetPage.locator('::-p-xpath(//*[@id=\\"__BVID__49\\"]/label[1])'),
            targetPage.locator(':scope >>> div.col-1 label.active'),
            targetPage.locator('::-p-text(Completo)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 50.5,
                y: 16.5,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Nome *)'),
            targetPage.locator('#cv_name'),
            targetPage.locator('::-p-xpath(//*[@id=\\"cv_name\\"])'),
            targetPage.locator(':scope >>> #cv_name')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 113,
                y: 22.515625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Nome *)'),
            targetPage.locator('#cv_name'),
            targetPage.locator('::-p-xpath(//*[@id=\\"cv_name\\"])'),
            targetPage.locator(':scope >>> #cv_name')
        ])
            .setTimeout(timeout)
            .fill('TESTE SCRAPER');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(CPF *)'),
            targetPage.locator('#cpf'),
            targetPage.locator('::-p-xpath(//*[@id=\\"cpf\\"])'),
            targetPage.locator(':scope >>> #cpf')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 127,
                y: 18.21875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(CPF *)'),
            targetPage.locator('#cpf'),
            targetPage.locator('::-p-xpath(//*[@id=\\"cpf\\"])'),
            targetPage.locator(':scope >>> #cpf')
        ])
            .setTimeout(timeout)
            .fill('123.456.789-09');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_personal_data > div:nth-of-type(1) div.mb-3 > div:nth-of-type(2)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[1]/div[2]/div[1]/div[2])'),
            targetPage.locator(':scope >>> #collapse_personal_data > div:nth-of-type(1) div.mb-3 > div:nth-of-type(2)'),
            targetPage.locator('::-p-text(CPF 123.456.789-09)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 161,
                y: 4.21875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_personal_data > div:nth-of-type(1) label:nth-of-type(2)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"gender\\"]/label[2])'),
            targetPage.locator(':scope >>> #collapse_personal_data > div:nth-of-type(1) label:nth-of-type(2)'),
            targetPage.locator('::-p-text(Homem)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 32.859375,
                y: 11.921875,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Selecione uma data)'),
            targetPage.locator('div.mb-lg-0 input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"birth_date\\"]/div/input)'),
            targetPage.locator(':scope >>> div.mb-lg-0 input')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 99,
                y: 11.921875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Selecione uma data)'),
            targetPage.locator('div.mb-lg-0 input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"birth_date\\"]/div/input)'),
            targetPage.locator(':scope >>> div.mb-lg-0 input')
        ])
            .setTimeout(timeout)
            .fill('15/05/1990');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.card div:nth-of-type(1) > div.card'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[1]/div[2])'),
            targetPage.locator(':scope >>> div.card div:nth-of-type(1) > div.card')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 476.5,
                y: 216.015625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Telefone fixo)'),
            targetPage.locator('#tel_fixo'),
            targetPage.locator('::-p-xpath(//*[@id=\\"tel_fixo\\"])'),
            targetPage.locator(':scope >>> #tel_fixo')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 186,
                y: 17.46875,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Telefone fixo)'),
            targetPage.locator('#tel_fixo'),
            targetPage.locator('::-p-xpath(//*[@id=\\"tel_fixo\\"])'),
            targetPage.locator(':scope >>> #tel_fixo')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 164,
                y: 12.46875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Telefone fixo)'),
            targetPage.locator('#tel_fixo'),
            targetPage.locator('::-p-xpath(//*[@id=\\"tel_fixo\\"])'),
            targetPage.locator(':scope >>> #tel_fixo')
        ])
            .setTimeout(timeout)
            .fill('4733333333');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Celular)'),
            targetPage.locator('#celular'),
            targetPage.locator('::-p-xpath(//*[@id=\\"celular\\"])'),
            targetPage.locator(':scope >>> #celular')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 162,
                y: 5.171875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Celular)'),
            targetPage.locator('#celular'),
            targetPage.locator('::-p-xpath(//*[@id=\\"celular\\"])'),
            targetPage.locator(':scope >>> #celular')
        ])
            .setTimeout(timeout)
            .fill('47999999999');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(E-mail *)'),
            targetPage.locator('#email'),
            targetPage.locator('::-p-xpath(//*[@id=\\"email\\"])'),
            targetPage.locator(':scope >>> #email')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 135,
                y: 8.875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(E-mail *)'),
            targetPage.locator('#email'),
            targetPage.locator('::-p-xpath(//*[@id=\\"email\\"])'),
            targetPage.locator(':scope >>> #email')
        ])
            .setTimeout(timeout)
            .fill('joao.secundario@email.com');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_personal_data > div:nth-of-type(2) div:nth-of-type(3) > div > div:nth-of-type(1)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[2]/div/div[3]/div/div[1])'),
            targetPage.locator(':scope >>> #collapse_personal_data > div:nth-of-type(2) div:nth-of-type(3) > div > div:nth-of-type(1)'),
            targetPage.locator('::-p-text(E-mail joao.secundario@email.com)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 188,
                y: 9.875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#cep'),
            targetPage.locator('::-p-xpath(//*[@id=\\"cep\\"])'),
            targetPage.locator(':scope >>> #cep')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 193,
                y: 16.828125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#cep'),
            targetPage.locator('::-p-xpath(//*[@id=\\"cep\\"])'),
            targetPage.locator(':scope >>> #cep')
        ])
            .setTimeout(timeout)
            .fill('89201100');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_personal_data > div:nth-of-type(3) > div > div:nth-of-type(1)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[3]/div/div[1])'),
            targetPage.locator(':scope >>> #collapse_personal_data > div:nth-of-type(3) > div > div:nth-of-type(1)'),
            targetPage.locator('::-p-text(CEP 89201-100)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 236,
                y: 15.828125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#street'),
            targetPage.locator('::-p-xpath(//*[@id=\\"street\\"])'),
            targetPage.locator(':scope >>> #street')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 189,
                y: 18.53125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#compiled-content'),
            targetPage.locator('::-p-xpath(//*[@id=\\"compiled-content\\"])'),
            targetPage.locator(':scope >>> #compiled-content')
        ])
            .setTimeout(timeout)
            .click({
              delay: 1094.7999999988824,
              offset: {
                x: 125,
                y: 1617,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#street'),
            targetPage.locator('::-p-xpath(//*[@id=\\"street\\"])'),
            targetPage.locator(':scope >>> #street')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 181,
                y: 17.53125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#number'),
            targetPage.locator('::-p-xpath(//*[@id=\\"number\\"])'),
            targetPage.locator(':scope >>> #number')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 138,
                y: 12.234375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#number'),
            targetPage.locator('::-p-xpath(//*[@id=\\"number\\"])'),
            targetPage.locator(':scope >>> #number')
        ])
            .setTimeout(timeout)
            .fill('123');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#compiled-content'),
            targetPage.locator('::-p-xpath(//*[@id=\\"compiled-content\\"])'),
            targetPage.locator(':scope >>> #compiled-content')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 31,
                y: 1602,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#street'),
            targetPage.locator('::-p-xpath(//*[@id=\\"street\\"])'),
            targetPage.locator(':scope >>> #street')
        ])
            .setTimeout(timeout)
            .fill('Rua das Palmeiras');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_personal_data > div:nth-of-type(3) div:nth-of-type(3)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[3]/div/div[3])'),
            targetPage.locator(':scope >>> #collapse_personal_data > div:nth-of-type(3) div:nth-of-type(3)'),
            targetPage.locator('::-p-text(Número 123)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 315,
                y: 8.234375,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#compiled-content'),
            targetPage.locator('::-p-xpath(//*[@id=\\"compiled-content\\"])'),
            targetPage.locator(':scope >>> #compiled-content')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 0,
                y: 1746,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#neighborhood'),
            targetPage.locator('::-p-xpath(//*[@id=\\"neighborhood\\"])'),
            targetPage.locator(':scope >>> #neighborhood')
        ])
            .setTimeout(timeout)
            .fill('Centro');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_personal_data > div:nth-of-type(3) div:nth-of-type(5) > input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[3]/div/div[5]/input)'),
            targetPage.locator(':scope >>> #collapse_personal_data > div:nth-of-type(3) div:nth-of-type(5) > input')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 336,
                y: 9.640625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(SC)'),
            targetPage.locator('div.col-lg-2 span.selection > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[3]/div/div[7]/div[1]/span/span[1]/span)'),
            targetPage.locator(':scope >>> div.col-lg-2 span.selection > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 146,
                y: 12.875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(SC)'),
            targetPage.locator('div.col-lg-2 span.selection > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[3]/div/div[7]/div[1]/span/span[1]/span)'),
            targetPage.locator(':scope >>> div.col-lg-2 span.selection > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 93,
                y: 11.875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('body > span input'),
            targetPage.locator('::-p-xpath(/html/body/span/span/span[1]/input)'),
            targetPage.locator(':scope >>> body > span input')
        ])
            .setTimeout(timeout)
            .fill('SC');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Joinville)'),
            targetPage.locator('div.col-lg-10 span.selection > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_personal_data\\"]/div[3]/div/div[7]/div[2]/div/span/span[1]/span)'),
            targetPage.locator(':scope >>> div.col-lg-10 span.selection > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 162,
                y: 12.40625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('body > span input'),
            targetPage.locator('::-p-xpath(/html/body/span/span/span[1]/input)'),
            targetPage.locator(':scope >>> body > span input')
        ])
            .setTimeout(timeout)
            .fill('Joinville');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('span.select2-results'),
            targetPage.locator('::-p-xpath(/html/body/span/span/span[2])'),
            targetPage.locator(':scope >>> span.select2-results')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 59,
                y: 89.4375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Perfil Profissional[role=\\"heading\\"])'),
            targetPage.locator('div:nth-of-type(5) > h2'),
            targetPage.locator('::-p-xpath(//*[@id=\\"formRef\\"]/div/div[2]/div/div/div/div[5]/h2)'),
            targetPage.locator(':scope >>> div:nth-of-type(5) > h2'),
            targetPage.locator('::-p-text(Perfil Profissional)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 69.3125,
                y: 11.9375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.col ul'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[1]/span/span[1]/span/ul)'),
            targetPage.locator(':scope >>> div.col ul')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 198.5,
                y: 14.125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.col input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[1]/span/span[1]/span/ul/li/input)'),
            targetPage.locator(':scope >>> div.col input')
        ])
            .setTimeout(timeout)
            .fill('Operador de Caixa');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Salário pretendido)'),
            targetPage.locator('#intended_salary'),
            targetPage.locator('::-p-xpath(//*[@id=\\"intended_salary\\"])'),
            targetPage.locator(':scope >>> #intended_salary'),
            targetPage.locator('::-p-text(0,00)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 106.5,
                y: 23.984375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Salário pretendido)'),
            targetPage.locator('#intended_salary'),
            targetPage.locator('::-p-xpath(//*[@id=\\"intended_salary\\"])'),
            targetPage.locator(':scope >>> #intended_salary'),
            targetPage.locator('::-p-text(0,00)')
        ])
            .setTimeout(timeout)
            .fill('');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Backspace');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Backspace');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Salário pretendido)'),
            targetPage.locator('#intended_salary'),
            targetPage.locator('::-p-xpath(//*[@id=\\"intended_salary\\"])'),
            targetPage.locator(':scope >>> #intended_salary'),
            targetPage.locator('::-p-text(0,00)')
        ])
            .setTimeout(timeout)
            .fill('250,000');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) ul'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[3]/div/div/span/span[1]/span/ul)'),
            targetPage.locator(':scope >>> div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) ul')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 194.5,
                y: 7.140625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[3]/div/div/span/span[1]/span/ul/li/input)'),
            targetPage.locator(':scope >>> div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) input')
        ])
            .setTimeout(timeout)
            .fill('Administrativo');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) ul'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[3]/div/div/span/span[1]/span/ul)'),
            targetPage.locator(':scope >>> div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) ul'),
            targetPage.locator('::-p-text(×Serviços AdministrativosAdministrativo)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 194.5,
                y: 27.6875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[3]/div/div/span/span[1]/span/ul/li/input)'),
            targetPage.locator(':scope >>> div.py-2 > div:nth-of-type(1) > div:nth-of-type(3) input')
        ])
            .setTimeout(timeout)
            .fill('Vendas');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('main div:nth-of-type(4) ul'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[4]/span/span[1]/span/ul)'),
            targetPage.locator(':scope >>> main div:nth-of-type(4) ul')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 311.5,
                y: 14.453125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Selecione uma opção)'),
            targetPage.locator('#collapse_professional_experience div:nth-of-type(4) input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_professional_experience\\"]/div[1]/div[1]/div[4]/span/span[1]/span/ul/li/input)'),
            targetPage.locator(':scope >>> #collapse_professional_experience div:nth-of-type(4) input')
        ])
            .setTimeout(timeout)
            .fill('Operacional');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Perfil Educacional[role=\\"button\\"])'),
            targetPage.locator('div.card > div > div > div > div:nth-of-type(7)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"formRef\\"]/div/div[2]/div/div/div/div[7])'),
            targetPage.locator(':scope >>> div.card > div > div > div > div:nth-of-type(7)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 234.5,
                y: 12.59375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Formação Acadêmica)'),
            targetPage.locator('#collapse_formation > div:nth-of-type(1) div.col-lg-5 span.selection > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_formation\\"]/div[1]/div/div/div[1]/div[1]/span/span[1]/span)'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) div.col-lg-5 span.selection > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 238.5,
                y: 16.25,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('body > span input'),
            targetPage.locator('::-p-xpath(/html/body/span/span/span[1]/input)'),
            targetPage.locator(':scope >>> body > span input')
        ])
            .setTimeout(timeout)
            .fill('Ensino Médio');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Instituição de ensino)'),
            targetPage.locator('#institute'),
            targetPage.locator('::-p-xpath(//*[@id=\\"institute\\"])'),
            targetPage.locator(':scope >>> #institute')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 199.5,
                y: 13.28125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Instituição de ensino)'),
            targetPage.locator('#institute'),
            targetPage.locator('::-p-xpath(//*[@id=\\"institute\\"])'),
            targetPage.locator(':scope >>> #institute')
        ])
            .setTimeout(timeout)
            .fill('Colégio Estadual');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#select2-form_education_time-container > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"select2-form_education_time-container\\"]/span)'),
            targetPage.locator(':scope >>> #select2-form_education_time-container > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 99.5,
                y: 3.953125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#select2-form_education_time-container > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"select2-form_education_time-container\\"]/span)'),
            targetPage.locator(':scope >>> #select2-form_education_time-container > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 99.5,
                y: 3.953125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Idioma)'),
            targetPage.locator('#collapse_formation > div:nth-of-type(2) div.my-2 > div.col-12 span.selection > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_formation\\"]/div[2]/div/div/div[1]/div[1]/span/span[1]/span)'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(2) div.my-2 > div.col-12 span.selection > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 94.5,
                y: 15.265625,
              },
            });
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Control');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Control');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Idioma) >>>> ::-p-aria([role=\\"textbox\\"])'),
            targetPage.locator('#select2-language_id-container'),
            targetPage.locator('::-p-xpath(//*[@id=\\"select2-language_id-container\\"])'),
            targetPage.locator(':scope >>> #select2-language_id-container')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 73.43749237060547,
                y: 12.267349243164062,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#select2-form_education_time-container > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"select2-form_education_time-container\\"]/span)'),
            targetPage.locator(':scope >>> #select2-form_education_time-container > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 109.44096374511719,
                y: 0.850677490234375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) div.my-2 > div:nth-of-type(3) input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"start\\"]/div/input)'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) div.my-2 > div:nth-of-type(3) input')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 70.04513549804688,
                y: 13.791656494140625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) div.my-2 > div:nth-of-type(3) input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"start\\"]/div/input)'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) div.my-2 > div:nth-of-type(3) input')
        ])
            .setTimeout(timeout)
            .fill('01/02/2005');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) div:nth-of-type(4) input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"conclude\\"]/div/input)'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) div:nth-of-type(4) input')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 64.55206298828125,
                y: 14.791656494140625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) div:nth-of-type(4) input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"conclude\\"]/div/input)'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) div:nth-of-type(4) input')
        ])
            .setTimeout(timeout)
            .fill('15/12/2007');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) div.my-2'),
            targetPage.locator('::-p-xpath(//*[@id=\\"collapse_formation\\"]/div[1]/div/div/div[1])'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) div.my-2')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 448.53819274902344,
                y: 168.51040649414062,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation div:nth-of-type(6) > div label:nth-of-type(1)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"btnradiosstudying\\"]/label[1])'),
            targetPage.locator(':scope >>> #collapse_formation div:nth-of-type(6) > div label:nth-of-type(1)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 44.548606872558594,
                y: 14.194427490234375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) label:nth-of-type(2)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"btnradiosstudying\\"]/label[2])'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) label:nth-of-type(2)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 38.8055419921875,
                y: 17.194427490234375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) label:nth-of-type(3)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"btnradiosstudying\\"]/label[3])'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) label:nth-of-type(3)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 30.815948486328125,
                y: 23.194427490234375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) label:nth-of-type(2)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"btnradiosstudying\\"]/label[2])'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) label:nth-of-type(2)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 33.8055419921875,
                y: 18.194427490234375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#collapse_formation > div:nth-of-type(1) label.active'),
            targetPage.locator('::-p-xpath(//*[@id=\\"btnradiosstudying\\"]/label[2])'),
            targetPage.locator(':scope >>> #collapse_formation > div:nth-of-type(1) label.active')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 43.8055419921875,
                y: 18.194427490234375,
              },
            });
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Salvar →)'),
            targetPage.locator('#form-footer-actions button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"form-footer-actions\\"]/div/div/button)'),
            targetPage.locator(':scope >>> #form-footer-actions button')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 48.9617919921875,
                y: 13.82635498046875,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria([role=\\"main\\"]) >>>> ::-p-aria([role=\\"separator\\"])'),
            targetPage.locator('hr'),
            targetPage.locator('::-p-xpath(//*[@id=\\"dashboard-body\\"]/main/div/div/div/div/div/div/div/hr)'),
            targetPage.locator(':scope >>> hr')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 529.524299621582,
                y: 0.125,
              },
            });
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria([role=\\"link\\"]) >>>> ::-p-aria([role=\\"generic\\"])'),
            targetPage.locator('div.vsm--list > div:nth-of-type(3) i'),
            targetPage.locator('::-p-xpath(//*[@id=\\"compiled-content\\"]/div[1]/div/div/div/div[1]/div[3]/a/i)'),
            targetPage.locator(':scope >>> div.vsm--list > div:nth-of-type(3) i')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 24.00347137451172,
                y: 28.204849243164062,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(TESTE SCRAPER[role=\\"heading\\"]) >>>> ::-p-aria([role=\\"generic\\"])'),
            targetPage.locator('#name-card-8656 > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"name-card-8656\\"]/span)'),
            targetPage.locator(':scope >>> #name-card-8656 > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 113.73609924316406,
                y: 1.5625,
              },
            });
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
