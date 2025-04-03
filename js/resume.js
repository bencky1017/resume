// ************************** 初始化加载默认版本 **************************

const JSONPATH = 'data/resume.json'
var jsonData = null;
var versionList = null;
var currentVersion = null;

// 初始化
window.onload = async () => {
    jsonData = await (await fetch(JSONPATH)).json();
    versionList = Object.keys(jsonData.versions);// 获取版本列表
    currentVersion = latestVersion(versionList);// 最新版本
    const data = jsonData.versions[currentVersion];// 根节点数据

    // 初始化切换版本列表
    initVersionList(versionList);

    // 通过数据属性精准设置
    const initialActiveItem = document.querySelector(
        `.version-item[data-version="${currentVersion}"]`
    );
    if (initialActiveItem) {
        initialActiveItem.classList.add('active');
    }

    // 渲染默认最新版本
    updateContent(jsonData.versions[currentVersion]);


    console.log(versionList, "当前最新版本：" + currentVersion);
    console.log('版本数据：', jsonData.versions[currentVersion]);

}

// **************************** 其他功能函数 ****************************

/**
 * 版本数组排序，默认上升排序，从`小`到`大`
 * @param {string[]} versions 版本数组
 * @param {boolean} [ascending=true] 默认上升排序
 * @returns {string[]} 
 * ```
 * const versions = ['v1', 'v1.0.2', 'v1.0', 'v2.3', 'v2.1.5'];
 * console.log(sortVersion(versions, false));
 * // 输出：['v2.3', 'v2.1.5', 'v1.0.2', 'v1', 'v1.0']
 * ```
 */
function sortVersion(versions, ascending = true) {
    if (versions.length === 0) return null;
    // 转换 v1.2.3 为 [1,2,3]
    const parseVersion = (v) => v.slice(1).split('.').map(Number);
    // 比较版本数组大小
    const compare = (obj1, obj2) => {
        const maxLen = Math.max(obj1.length, obj2.length);
        for (let i = 0; i < maxLen; i++) {
            const numA = i < obj1.length ? obj1[i] : 0;
            const numB = i < obj2.length ? obj2[i] : 0;
            if (numA !== numB) return ascending ? numA - numB : numB - numA;
        }
        return 0;
    };
    // 轮流比较版本，返回版本数组
    // 创建副本避免修改原数组
    return [...versions].sort((v1, v2) => {
        return compare(parseVersion(v1), parseVersion(v2));
    });
}

/**
 * 判断最大版本，需要调用`sortVersion`方法
 * 
 * @param {string[]} versions 版本数组
 * @returns {string} 对应版本
 * ```
 * const versions = ['v1', 'v1.0.2', 'v1.0', 'v2.3', 'v2.1.5'];
 * console.log(latestVersion(versions));// 输出：'v2.3'
 * ```
 */
function latestVersion(versions) {
    const sorted = sortVersion(versions, false); // 直接利用排序函数
    return sorted.length > 0 ? sorted[0] : null;
}

/**
 * 判断最大版本org
 * 
 * @param {string[]} versions 
 * @returns {string[]} 
 * ```
 * const versions = ['v1', 'v1.0.2', 'v1.0', 'v2.3', 'v2.1.5'];
 * console.log(latestVersion(versions)); // 输出: 'v2.3'
 * ```
 */
/* function latestVersion(versions) {
    if (versions.length === 0) return null;
    // 转换 v1.2.3 为 [1,2,3]
    const parseVersion = (v) => v.slice(1).split('.').map(Number);
    // 比较版本数组大小
    const compare = (obj1, obj2) => {
        const maxLen = Math.max(obj1.length, obj2.length);
        for (let i = 0; i < maxLen; i++) {
            const numA = i < obj1.length ? obj1[i] : 0;
            const numB = i < obj2.length ? obj2[i] : 0;
            if (numA > numB) return 1;
            if (numA < numB) return -1;
        }
        return 0;
    };
    // 轮流比较版本，返回最大版本
    return versions.reduce((maxV, currentV) => {
        const current = parseVersion(currentV);
        const max = parseVersion(maxV);
        return compare(current, max) > 0 ? currentV : maxV;
    });
} */

/**
 * Description placeholder
 *
 * @param {string[]} versionList 版本列表
 * @returns {{}} 
 */
function initVersionList(versionList) {
    // 添加版本列表
    const versionListDiv = document.getElementById('versionList');
    versionListDiv.innerHTML = sortVersion(versionList, false)
        .map(v => `
            <div class="version-item ${v === currentVersion ? 'active' : ''}" 
                onclick="switchVersion('${v}')"
                data-version="${v}"> <!-- 添加数据属性 -->
                ${v}
            </div>
        `).join('');
}

// ****************************** 切换按钮 ******************************
// 版本切换功能
async function switchVersion(selectedVersion) {
    // 移除旧版本激活状态
    document.querySelectorAll('.version-item').forEach(item => {
        item.classList.remove('active');
    });

    // 通过data属性精准查找
    const targetItem = document.querySelector(
        `.version-item[data-version="${selectedVersion}"]`
    );

    if (targetItem) {
        targetItem.classList.add('active');
        currentVersion = selectedVersion; // 更新全局变量
    }

    // 更新内容
    updateContent(jsonData.versions[currentVersion]);
    document.getElementById('versionList').classList.remove('show');
}

// 切换版本列表显示隐藏状态
function toggleVersions() {
    document.getElementById('versionList').classList.toggle('show');
}



// **************************** 核心渲染函数 ****************************
// 通用渲染函数
function _renderCategory(dataKey, containerDiv, isProject = false) {
    const data = jsonData.versions[currentVersion][dataKey];
    if (!data) {
        containerDiv.style.display = 'none';
        return;
    }

    const infoTable = containerDiv.querySelector(isProject ? '.project_list' : '.infotable');
    const categoryInfo = containerDiv.querySelector(isProject ? '.project_info' : '.category_info');

    // 清空现有内容
    categoryInfo.innerHTML = '';
    infoTable.innerHTML = '';

    // 创建标题
    const titleHTML = `
        <img class="${isProject ? 'prolineHorizon' : 'lineHorizon'}" src="img/lineHorizon.png">
        <p>${data.title}</p>
    `;
    categoryInfo.innerHTML = titleHTML;

    // 创建内容行
    data.item.forEach(item => {
        if (!item.content && !item.contents) return;

        const row = document.createElement(isProject ? 'li' : 'tr');
        let contentHTML = '';

        // 图标处理
        if (item.icon) {
            contentHTML += `<td><img src="${item.icon}"></td>`;
        }

        // 复合内容处理
        let contentValue = '';
        if (item.contents) {
            contentValue = item.contents.sub
                ? `${item.contents.value}<span style="font-size:16px;font-weight:normal">(${item.contents.sub})</span>`
                : item.contents.value;
        } else {
            contentValue = item.content;
        }

        // 构建单元格
        contentHTML += `
            <td${isProject ? ' valign="top"' : ''}>${item.label}：</td>
            <td data-field="${item.field}" ${isProject ? 'style="font-size:16px;color:#000;font-weight:normal;"' : ''}>
                ${contentValue}
            </td>
        `;

        row.innerHTML = contentHTML;
        infoTable.appendChild(row);
    });

    containerDiv.style.display = 'block';
}


function updateContent(data) {
    // ************************ 链接形式，直接跳转 ************************
    if (data.islink.bool && data.islink.url) {
        // 如果是链接形式
        window.open(data.islink.url);//打开链接
        return
    }
    // ************************ 全局DOM清理 ************************
    // ======== 新增：全局清理 ========
    // 清理工作经历动态表格
    document.querySelectorAll('.workHistoryTable').forEach(table => table.remove());
    // 清理荣誉技能子表格
    document.querySelectorAll('.sub_projecttable').forEach(table => table.remove());
    // 清理性格能力残留行
    const paTable = document.querySelector('[data-field="personalityAbility"] .projecttable');
    if (paTable) paTable.innerHTML = '';
    // 清理自我评价残留行
    const seTable = document.querySelector('[data-field="selfEvaluate"] .projecttable');
    if (seTable) seTable.innerHTML = '';

    // ************************ 总体公共信息 ************************
    const main_left = document.querySelector('.main-left');// 获取左侧节点，用于后续根据json文件添加内容
    // 左侧
    const personInfoDiv = document.querySelector('[data-field="personInfo"]').closest('.category');
    const jobOrderDiv = document.querySelector('[data-field="jobOrder"]').closest('.category');
    const educationDiv = document.querySelector('[data-field="education"]').closest('.category');
    const personCreationDiv = document.querySelector('[data-field="personCreation"]').closest('.category');
    // 结尾
    const endingDiv = document.querySelector('.ending')
    // 右侧
    const honorSkillsDiv = document.querySelector('[data-field="honorSkills"]').closest('.project');
    const workHistoryDiv = document.querySelector('[data-field="workHistory"]').closest('.project');
    const personalityAbilityDiv = document.querySelector('[data-field="personalityAbility"]').closest('.project');
    const selfEvaluateDiv = document.querySelector('[data-field="selfEvaluate"]').closest('.project');

    let infoTable = null;
    let categoryInfo = null;
    let projectInfo = null;

    // 1. ************************ 头部信息更新 ************************
    document.querySelector('.headpic').src = data.headpic.src;
    document.querySelector('.headpic').alt = data.headpic.alt;
    document.querySelector('.headpic_title').textContent = data.headpic.title;

    // 2. ************************** 个人信息 **************************
    // 获取节点
    infoTable = personInfoDiv.querySelector('.infotable');
    categoryInfo = personInfoDiv.querySelector('.category_info');
    // 清空现有内容
    if (categoryInfo) categoryInfo.innerHTML = '';
    if (infoTable) infoTable.innerHTML = '';
    // 检测 personInfo 是否存在
    if (data.personInfo) {
        // 显示整个分类区块
        personInfoDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="lineHorizon" src="img/lineHorizon.png">
            <p>${data.personInfo.title}</p>
        `;
        categoryInfo.innerHTML = titleHTML;
        // 创建表格内容
        data.personInfo.item.forEach(item => {
            // 跳过没有内容的条目
            if (!item.content && !item.contents) return;
            const row = document.createElement('tr');
            // 构建单元格内容
            let contentHTML = '';
            // 单独处理姓名
            if (item.contents) {
                // 处理复合内容（姓名+英文名）
                if (item.contents.sub) {
                    contentHTML = `${item.contents.value}<span style="font-size:16px;font-weight:normal">${'(' + item.contents.sub + ')'}</span>`;
                } else {
                    contentHTML = `${item.contents.value}`;
                }
            } else {
                // 处理普通内容
                contentHTML = item.content;
            }
            row.innerHTML = `
                <td><img src="${item.icon}"></td>
                <td align="center">${item.label}：</td>
                <td data-field="${item.field}">${contentHTML}</td>
            `;
            infoTable.appendChild(row);
        });
    } else {
        // 隐藏整个分类区块
        personInfoDiv.style.display = 'none';
    }

    // 3. ************************** 求职意向 **************************
    // 获取节点
    infoTable = jobOrderDiv.querySelector('.infotable');
    categoryInfo = jobOrderDiv.querySelector('.category_info');
    // 清空现有内容
    if (categoryInfo) categoryInfo.innerHTML = '';
    if (infoTable) infoTable.innerHTML = '';
    // 检测 jobOrder 是否存在
    if (data.jobOrder) {
        // 显示整个分类区块
        jobOrderDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="lineHorizon" src="img/lineHorizon.png">
            <p>${data.jobOrder.title}</p>
        `;
        categoryInfo.innerHTML = titleHTML;
        // 创建内容
        const row = document.createElement('tr');
        let item = data.jobOrder.item;//只有一个
        let contentHTML = '';
        if (item.icon) {
            contentHTML += `<td><img src="${item.icon}"></td>`
        }
        if (item.contents) {
            item.contents.forEach((sub_item, index) => {
                const sub_row = document.createElement('tr');
                sub_row.innerHTML += `
                    <td>${index == 0 ? item.label+'：' : ''}</td>
                    <td>${sub_item}</td>
                `;
                infoTable.appendChild(sub_row);
            })
        } else {
            contentHTML += `
                <td>${item.label}：</td>
                <td data-field="${item.field}">${item.content}</td>
            `;
        }

        row.innerHTML = contentHTML;
        infoTable.appendChild(row);
    } else {
        jobOrderDiv.style.display = 'none';
    }

    // 4. ************************** 教育背景 **************************
    // 获取节点
    infoTable = educationDiv.querySelector('.infotable');
    categoryInfo = educationDiv.querySelector('.category_info');
    // 清空现有内容
    if (categoryInfo) categoryInfo.innerHTML = '';
    if (infoTable) infoTable.innerHTML = '';
    // 检测 education 是否存在
    if (data.education) {
        // 显示整个分类区块
        educationDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="lineHorizon" src="img/lineHorizon.png">
            <p>${data.education.title}</p>
        `;
        categoryInfo.innerHTML = titleHTML;
        // 创建表格内容
        data.education.item.forEach(item => {
            // 跳过没有的内容
            if (!item.content) return;
            const row = document.createElement('tr');
            let contentHTML = '';
            if (item.icon) {
                contentHTML += `<td><img src="${item.icon}"></td>`
            }
            contentHTML += `
                <td valign="top">${item.label}：</td>
				<td data-field="${item.field}">${item.content}</td>
            `;
            row.innerHTML = contentHTML;
            infoTable.appendChild(row);
        })
    } else {
        educationDiv.style.display = 'none';
    }

    // 5. ************************** 个人作品 **************************
    // 获取节点
    infoTable = personCreationDiv.querySelector('.infotable');
    categoryInfo = personCreationDiv.querySelector('.category_info');
    // 清空现有内容
    if (categoryInfo) categoryInfo.innerHTML = '';
    if (infoTable) infoTable.innerHTML = '';
    // 检测 personCreation 是否存在
    if (data.personCreation) {
        // 显示整个分类区块
        personCreationDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="lineHorizon" src="img/lineHorizon.png">
            <p>${data.personCreation.title}</p>
        `;
        categoryInfo.innerHTML = titleHTML;
        // 创建表格内容
        data.personCreation.item.forEach(item => {
            // 跳过没有的内容
            if (!item.content && !item.contents) return;
            const row = document.createElement('tr');
            let contentHTML = '';
            if (item.icon) {
                contentHTML += `<td><img src="${item.icon}"></td>`
            }
            contentHTML += `
                <td valign="top" align="left">${item.label}：</td>
                <td data-field="${item.field}" style="font-size:16px;color:#000;font-weight: normal;">${item.content}</td>
            `;
            row.innerHTML = contentHTML;
            infoTable.appendChild(row);
        })
    } else {
        personCreationDiv.style.display = 'none';
    }

    // ************************ Main-Left结束语 ************************
    endingDiv.innerHTML = data.ending.content

    // 6. ************************** 荣誉技能 **************************
    // 获取节点
    projecttable = honorSkillsDiv.querySelector('.projecttable');
    projectInfo = honorSkillsDiv.querySelector('.project_info');
    // 清空现有内容
    if (projecttable) projecttable.innerHTML = '';
    if (projectInfo) projectInfo.innerHTML = '';
    if (data.honorSkills) {
        // 显示整个分类区块
        honorSkillsDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="prolineHorizon" src="img/lineHorizon.png">
            <p>${data.honorSkills.title}</p>
        `;
        projectInfo.innerHTML = titleHTML;
        // 创建表格内容
        data.honorSkills.item.forEach(item => {
            // 跳过没有的内容
            if (!item.content && !item.contents) return;
            if (item.content) {
                const row = document.createElement('tr');
                // 处理普通条目
                row.innerHTML = `
                    <td class="fore" valign="top">${item.label}：</td>
                    <td>${item.content || ''}</td><!-- 普通内容留空 -->
                `;
                projecttable.appendChild(row);
            }
            // 处理嵌套条目
            if (item.contents) {
                const parent_row = document.createElement('tr');
                parent_row.innerHTML = `
                    <td class="fore" valign="top" data-field="sub_table_label">${item.label}：</td>
                `;
                projecttable.appendChild(parent_row);
                // 创建子表格
                const sub_table = document.createElement('table');
                sub_table.classList.add('sub_projecttable');
                sub_table.border = 0;

                // 独立子表格
                item.contents.forEach(sub => {
                    const sub_row = document.createElement('tr');
                    sub_row.innerHTML = `
                    <td class="fore_sub" valign="top">${sub.label}：</td>
                    <td>${sub.desc}</td>
                    `;
                    sub_table.appendChild(sub_row);
                })
                projecttable.insertAdjacentElement('afterend', sub_table);
            }
        });
    } else {
        honorSkillsDiv.style.display = 'none';
    }

    // 7. ************************ 工作经历 ************************
    // 
    // 获取节点
    projecttable = workHistoryDiv.querySelector('.projecttable');
    projectInfo = workHistoryDiv.querySelector('.project_info');
    // 清空现有内容
    if (projecttable) projecttable.innerHTML = '';
    if (projectInfo) projectInfo.innerHTML = '';
    if (data.workHistory) {
        // 显示整个分类区块
        workHistoryDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="prolineHorizon" src="img/lineHorizon.png">
            <p>${data.workHistory.title}</p>
        `;
        projectInfo.innerHTML = titleHTML;
        // 创建表格内容
        data.workHistory.item.forEach((item, index) => {
            // 创建主表格
            const mainTable = document.createElement('table');
            // 设置表格样式
            mainTable.border = 0;
            mainTable.classList.add('projecttable', 'workHistoryTable');
            mainTable.style.width = '600px';
            mainTable.style.borderSpacing = '0px 10px';
            // 添加公司信息行
            const companyRow = document.createElement('tr');
            companyRow.className = 'practice';
            companyRow.innerHTML = `
                <td width="160px" align="left">${item.unit.period}</td>
                <td>${item.unit.company}</td>
                <td width="150px">${item.unit.post}</td>
            `;
            mainTable.appendChild(companyRow);
            // 添加经历标题行
            const titleRow = document.createElement('tr');
            titleRow.innerHTML = `
                <td><b>${item.experience.name}：</b></td>
            `;
            mainTable.appendChild(titleRow);
            // 添加经历描述
            item.experience.desc.forEach(desc => {
                const descRow = document.createElement('tr');
                descRow.innerHTML = `
                    <td colspan="3">${desc}</td>
                `;
                mainTable.appendChild(descRow);
            });
            // 插入到容器
            workHistoryDiv.appendChild(mainTable);
        });
    } else {
        workHistoryDiv.style.display = 'none';
    }

    // 8. ************************ 性格能力 ************************
    // 获取节点
    projecttable = personalityAbilityDiv.querySelector('.projecttable');
    projectInfo = personalityAbilityDiv.querySelector('.project_info');
    // 清空现有内容
    if (projecttable) projecttable.innerHTML = '';
    if (projectInfo) projectInfo.innerHTML = '';
    if (data.personalityAbility) {
        // 显示整个分类区块
        personalityAbilityDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="prolineHorizon" src="img/lineHorizon.png">
            <p>${data.personalityAbility.title}</p>
        `;
        projectInfo.innerHTML = titleHTML;
        // 创建表格内容
        data.personalityAbility.item.forEach(item => {
            // 创建主行
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fore" valign="top" align="center" width="50px;">${item.name}：</td>
                <td>${item.desc[0]}</td>
            `;
            projecttable.appendChild(row);
            // 处理额外描述项
            if (item.desc.length > 1) {
                item.desc.slice(1).forEach(desc => {
                    const extra_row = document.createElement('tr');
                    extra_row.innerHTML = `
                        <td></td>
                        <td>${desc}</td>
                    `;
                    projecttable.appendChild(extra_row);
                });
            }
        });
    } else {
        personalityAbilityDiv.style.display = 'none';
    }

    // 9. ************************ 自我评价 ************************
    // 想要将这个模块放到main-left中
    // infoTable = jobOrderDiv.querySelector('.infotable');
    // categoryInfo = jobOrderDiv.querySelector('.category_info');

    // 获取节点
    projecttable = selfEvaluateDiv.querySelector('.projecttable');
    projectInfo = selfEvaluateDiv.querySelector('.project_info');
    // 清空现有内容
    if (projecttable) projecttable.innerHTML = '';
    if (projectInfo) projectInfo.innerHTML = '';
    if (data.selfEvaluate) {
        // 显示整个分类区块
        selfEvaluateDiv.style.display = 'block';
        // 创建标题部分
        const titleHTML = `
            <img class="prolineHorizon" src="img/lineHorizon.png">
            <p>${data.selfEvaluate.title}</p>
        `;
        projectInfo.innerHTML = titleHTML;
        // 创建表格内容
        data.selfEvaluate.item.forEach(item => {
            // 创建主行
            const row = document.createElement('tr');
            // 自动分离符号和内容
            const symbol = item[0] || '◆';  // 首字符作为符号
            const content = item.slice(1);  // 剩余部分作为内容
            row.innerHTML = `
                <td>${symbol}</td>
                <td>${content}</td>
            `;
            projecttable.appendChild(row);
            // 设置表格样式
            projecttable.style.width = '600px';
            // 添加行间距
            projecttable.style.borderSpacing = '0 8px';
        });
    } else {
        selfEvaluateDiv.style.display = 'none';
    }
}

