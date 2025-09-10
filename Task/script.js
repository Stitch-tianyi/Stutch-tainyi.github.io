let uploadCount = 0
let progress = 0
let imageSaved = false
let step2Completed = false
let uploadedFiles = new Set() // 用于存储已上传的文件名

// 任务状态跟踪
let taskStatus = {
    step1: false,
    step2: false,
    step3: false
}

// DOM元素引用
const saveImageBtn = document.getElementById('save-image-btn')
const completeStep2Btn = document.getElementById('complete-step2-btn')
const submitBtn = document.getElementById('submit-btn')
const backToHomeBtn = document.getElementById('back-to-home-btn')
const backToTaskBtn = document.getElementById('back-to-task-btn')
const fileInput1 = document.getElementById('file-input-1')
const fileInput2 = document.getElementById('file-input-2')
const fileInput3 = document.getElementById('file-input-3')
const validationError = document.getElementById('validation-error')
const error1 = document.getElementById('error-1')
const error2 = document.getElementById('error-2')
const error3 = document.getElementById('error-3')
const promoImage = document.getElementById('promo-image')
const toast = document.getElementById('toast')
const confirmModal = document.getElementById('confirm-modal')
const modalConfirm = document.getElementById('modal-confirm')
const modalCancel = document.getElementById('modal-cancel')

// 步骤状态元素
const step1Status = document.getElementById('step1-status')
const step2Status = document.getElementById('step2-status')
const step3Status = document.getElementById('step3-status')

// 步骤元素
const step1 = document.getElementById('step1')
const step2 = document.getElementById('step2')
const step3 = document.getElementById('step3')

// 显示提示信息 - 已修复居中问题
function showToast (message) {
    toast.textContent = message
    toast.classList.add('show')

    setTimeout(() => {
        toast.classList.remove('show')
    }, 3000)
}

// 显示确认模态框
function showConfirmModal () {
    confirmModal.style.display = 'flex'
}

// 隐藏确认模态框
function hideConfirmModal () {
    confirmModal.style.display = 'none'
}
// 保存宣传图片
function savePromoImage () {
    const link = document.createElement('a')
    // 设置a标签为不可见
    link.style.display = 'none'
    // 将a标签添加到body
    document.body.appendChild(link)
    // 设置a标签的href
    link.href = document.querySelector('#save-image').src
    // 设置a标签的download
    link.download = '宣传图片.jpg'
    // 模拟点击事件进行下载
    link.click()
    // 下载完成后移除a标签
    document.body.removeChild(link)

    // 显示提示
    showToast('图片已保存到相册！')

    // 标记图片已保存
    imageSaved = true
    taskStatus.step1 = true

    // 更新步骤1状态
    step1Status.innerHTML = '<i class="fas fa-check-circle"></i> 已完成'
    step1Status.classList.add('completed')

    // 解锁第二步
    unlockStep(2)

    // 更新进度
    updateProgress()

    // 隐藏模态框
    hideConfirmModal()
}

// 解锁指定步骤
function unlockStep (stepNumber) {
    if (stepNumber === 2 && taskStatus.step1) {
        step2.classList.remove('locked')
        step2Status.innerHTML = '<i class="fas fa-clock"></i> 未完成'
        completeStep2Btn.disabled = false
    } else if (stepNumber === 3 && taskStatus.step2) {
        step3.classList.remove('locked')
        step3Status.innerHTML = '<i class="fas fa-clock"></i> 未完成'

        // 启用文件上传
        fileInput1.disabled = false
        fileInput2.disabled = false
        fileInput3.disabled = false

        // 更新上传区域文本
        document.querySelectorAll('.upload-text').forEach(el => {
            el.textContent = '点击上传图片 (10MB以内)'
        })
    }
}

// 完成步骤
function completeStep2 () {
    const step = document.getElementById('step2')
    step.classList.add('step-completed')

    // 标记第二步完成
    step2Completed = true
    taskStatus.step2 = true

    // 更新步骤2状态
    step2Status.innerHTML = '<i class="fas fa-check-circle"></i> 已完成'
    step2Status.classList.add('completed')

    // 解锁第三步
    unlockStep(3)

    // 更新进度
    updateProgress()
}

// 验证图片是否重复
function validateImage (file, areaId) {
    const fileName = file.name.toLowerCase()
    const errorElement = document.getElementById(`error-${areaId}`)

    // 检查是否已上传相同文件
    if (uploadedFiles.has(fileName)) {
        errorElement.textContent = '此图片已上传过，请选择不同的图片'
        errorElement.style.display = 'block'
        return false
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        errorElement.textContent = '请选择图片文件！'
        errorElement.style.display = 'block'
        return false
    }

    // 检查文件大小 (10MB以内)
    if (file.size > 10 * 1024 * 1024) {
        errorElement.textContent = '文件大小不能超过10MB！'
        errorElement.style.display = 'block'
        return false
    }

    // 验证通过，隐藏错误信息
    errorElement.style.display = 'none'
    return true
}

// 处理文件选择
function handleFileSelect (input, areaId) {
    const file = input.files[0]
    if (!file) return

    // 验证图片
    if (!validateImage(file, areaId)) {
        return
    }

    const area = document.getElementById(`upload-area-${areaId}`)
    const preview = document.getElementById(`preview-${areaId}`)
    const icon = area.querySelector('.upload-icon')
    const text = area.querySelector('.upload-text')

    // 显示上传中
    icon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
    text.textContent = '上传中...'

    // 读取文件并显示预览
    const reader = new FileReader()
    reader.onload = function (e) {
        // 模拟上传延迟
        setTimeout(() => {
            // 显示预览
            preview.src = e.target.result
            preview.style.display = 'block'

            // 更新图标和文本
            icon.innerHTML = '<i class="fas fa-check" style="color: #00c850;"></i>'
            text.textContent = '上传成功！点击可重新选择'

            // 增加上传计数
            if (!area.classList.contains('uploaded')) {
                area.classList.add('uploaded')
                uploadCount++

                // 添加到已上传文件集合
                uploadedFiles.add(file.name.toLowerCase())
            } else {
                // 如果替换了图片，更新文件名
                uploadedFiles.delete(area.dataset.originalFileName)
                uploadedFiles.add(file.name.toLowerCase())
            }

            // 保存原始文件名
            area.dataset.originalFileName = file.name.toLowerCase()

            // 如果上传了至少一张图片，启用提交按钮
            if (uploadCount >= 1) {
                submitBtn.disabled = false
            }

            // 如果上传了三张图片，标记步骤3完成
            if (uploadCount >= 3) {
                taskStatus.step3 = true
                step3Status.innerHTML = '<i class="fas fa-check-circle"></i> 已完成'
                step3Status.classList.add('completed')
                step3.classList.add('step-completed')
            }

            // 更新进度
            updateProgress()

            // 隐藏全局验证错误
            validationError.style.display = 'none'
        }, 1500)
    }
    reader.readAsDataURL(file)
}

// 验证并提交表单
function validateAndSubmit () {
    // 检查是否上传了三张图片
    if (uploadCount < 3) {
        showToast(`请上传全部3张截图！您已上传${uploadCount}/3张`)
        return
    }

    // 检查是否有重复图片
    if (uploadedFiles.size < 3) {
        validationError.textContent = '请上传三张不同的截图！'
        validationError.style.display = 'block'
        showToast('请上传三张不同的截图！')
        return
    }

    submitForm()
}

// 更新进度条
function updateProgress () {
    // 计算步骤完成进度 (最多60%)
    let stepsProgress = 0
    if (taskStatus.step1) stepsProgress += 20
    if (taskStatus.step2) stepsProgress += 20
    if (taskStatus.step3) stepsProgress += 20

    // 计算上传进度 (最多40%)
    const uploadProgress = Math.min(40, Math.round((uploadCount / 3) * 40))

    // 总进度
    progress = stepsProgress + uploadProgress

    // 更新所有进度条
    const progressElements = [
        document.getElementById('main-progress'),
        document.getElementById('task-progress'),
        document.getElementById('resource-progress')
    ]

    const textElements = [
        document.getElementById('progress-text'),
        document.getElementById('task-progress-text'),
        document.getElementById('resource-progress-text')
    ]

    const percentElements = [
        document.getElementById('progress-percent'),
        document.getElementById('task-progress-percent'),
        document.getElementById('resource-progress-percent')
    ]

    progressElements.forEach(el => {
        if (el) el.style.width = `${progress}%`
    })

    textElements.forEach(el => {
        if (el) el.textContent = `${progress}%`
    })

    percentElements.forEach(el => {
        if (el) el.textContent = `${progress}%`
    })
}

// 表单提交功能
function submitForm () {
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 审核中...'

    // 模拟审核过程
    setTimeout(() => {

        // 更新进度到100%
        progress = 100
        updateProgress()

        // 3秒后跳转到资源页面
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 提交审核'
            submitBtn.disabled = false
            window.location.href = '../ending.html'
        }, 3000)
    }, 2000)
}

// 初始化事件监听
function initEventListeners () {
    saveImageBtn.addEventListener('click', () => {
        if (!taskStatus.step1) {
            showConfirmModal()
        }
    })
    completeStep2Btn.addEventListener('click', () => {
        if (taskStatus.step1 && !taskStatus.step2) {
            completeStep2()
            showToast('步骤2已完成！')
        } else if (!taskStatus.step1) {
            showToast('请先完成步骤1！')
        }
    })
    submitBtn.addEventListener('click', validateAndSubmit)

    fileInput1.addEventListener('change', () => {
        if (taskStatus.step2) {
            handleFileSelect(fileInput1, 1)
        } else {
            showToast('请先完成步骤2！')
        }
    })
    fileInput2.addEventListener('change', () => {
        if (taskStatus.step2) {
            handleFileSelect(fileInput2, 2)
        } else {
            showToast('请先完成步骤2！')
        }
    })
    fileInput3.addEventListener('change', () => {
        if (taskStatus.step2) {
            handleFileSelect(fileInput3, 3)
        } else {
            showToast('请先完成步骤2！')
        }
    })

    modalConfirm.addEventListener('click', savePromoImage)
    modalCancel.addEventListener('click', hideConfirmModal)

    backToHomeBtn.addEventListener('click', () => window.location.replace(document.referrer))

}

// 获取钩子详细信息
function getItemInfo () {
    const itemInfo = JSON.parse(window.localStorage.getItem('itemInfo'))
    if (!itemInfo) {
        alert('数据错误，请返回首页')
    } else {
        const images = document.getElementsByClassName('promo-image')
        for (let i = 0; i < images.length; i++) {
            if (!!itemInfo.images[i]) {
                images[i].src = itemInfo.images[i]
            }
        }
    }
}

// 页面加载时初始化
window.addEventListener('load', function () {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.style.animationDelay = (index * 0.2) + 's'
    })

    // 初始化事件监听
    initEventListeners()

    // 初始化进度条
    updateProgress()

    // 获取钩子信息
    getItemInfo()
})