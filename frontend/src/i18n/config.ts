import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


const resources = {
  en: {
    translation: {
      // Common
      common: {
        appName: 'JLPT',
        welcome: 'Welcome',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        close: 'Close',
        completed: 'Completed',
        viewAll: 'View All',
      },
      
      // Auth
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
        resetPassword: 'Reset Password',
        sendResetLink: 'Send Reset Link',
        backToLogin: 'Back to Login',
        invalidEmail: 'Please enter a valid email address',
        passwordTooShort: 'Password must be at least 6 characters',
        fullNameRequired: 'Please enter your full name',
        passwordMismatch: 'Passwords do not match',
        resetLinkSent: 'Password reset link sent to {{email}}',
        resetPasswordDesc: "Enter your email address and we'll send you a link to reset your password.",
        registerSuccess: 'Registration successful!',
        loginSuccess: 'Login successful!',
      },
      
      // Landing
      landing: {
        title: 'JLPT Master',
        subtitle: 'Master Japanese Language Proficiency Test',
        description: 'Practice JLPT tests with realistic questions, instant feedback, and progress tracking.',
        start: 'Start Now',
        features: {
          practice: 'Practice Tests',
          practiceDesc: 'Full-length JLPT tests for all levels',
          tracking: 'Progress Tracking',
          trackingDesc: 'Monitor your improvement over time',
          feedback: 'Instant Feedback',
          feedbackDesc: 'Get detailed explanations for every answer',
        },
      },
      
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        tests: 'Tests',
        history: 'History',
        profile: 'Profile',
        settings: 'Settings',
      },

      // Dashboard
      dashboard: {
        recentAttempts: 'Recent Attempts',
        weeklyActivity: 'Weekly Activity',
        last7Days: 'Last 7 days',
        today: 'Today',
        otherDays: 'Other days',
      },
      
      // Settings
      settings: {
        darkMode: 'Dark Mode',
        language: 'Language',
        theme: 'Theme',
      },

      // Profile
      profile: {
        title: 'Profile',
        subtitle: 'Manage your account settings',
        editProfile: 'Edit Profile',
        fullName: 'Full Name',
        email: 'Email',
        changePassword: 'Change Password',
        changePasswordTitle: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmNewPassword: 'Confirm New Password',
        updatePassword: 'Update Password',
        changeAvatar: 'Change Avatar',
        uploadAvatar: 'Upload Avatar',
        selectImage: 'Please select an image file',
        maxSize: 'Maximum file size: 5MB',
        updating: 'Updating...',
        updateSuccess: 'Profile updated successfully!',
        avatarSuccess: 'Avatar updated successfully!',
        passwordSuccess: 'Password changed successfully!',
        studyTime: 'Total Study Time',
      },

      // Tests
      tests: {
        completed: 'Completed',
        inProgress: 'In Progress',
        sections: 'Sections',
        avgScore: 'Avg Score',
      },

     
     

      // History
      history: {
        title: 'Test History',
        subtitle: 'View your test attempts and results',
        completedTests: 'Completed Tests',
        incompleteTests: 'Incomplete Tests',
        avgScore: 'Average Score',
        highScore: 'Highest Score',
        activityHeatmap: 'Activity Heatmap',
        legend: 'Less',
        legendMore: 'More',
        testAttempts: 'Test Attempts',
        noAttempts: 'No test attempts yet',
        viewResults: 'View Results',
        continueTest: 'Continue Test',
        status: 'Status',
        score: 'Score',
        date: 'Date',
        passed: 'Passed',
        failed: 'Failed',
        inProgress: 'In Progress',
      },
   
    },
  },
  
  ja: {
    translation: {
      common: {
        appName: 'JLPT',
        welcome: 'ようこそ',
        loading: '読み込み中...',
        error: 'エラー',
        success: '成功',
        cancel: 'キャンセル',
        confirm: '確認',
        save: '保存',
        delete: '削除',
        edit: '編集',
        back: '戻る',
        next: '次へ',
        submit: '送信',
        close: '閉じる',
        completed: '完了',
        viewAll: 'すべて見る',
      },
      
      auth: {
        login: 'ログイン',
        register: '新規登録',
        logout: 'ログアウト',
        email: 'メールアドレス',
        password: 'パスワード',
        fullName: '氏名',
        confirmPassword: 'パスワード確認',
        forgotPassword: 'パスワードをお忘れですか？',
        dontHaveAccount: 'アカウントをお持ちでないですか？',
        alreadyHaveAccount: '既にアカウントをお持ちですか？',
        resetPassword: 'パスワードリセット',
        sendResetLink: 'リセットリンクを送信',
        backToLogin: 'ログインに戻る',
        invalidEmail: '有効なメールアドレスを入力してください',
        passwordTooShort: 'パスワードは6文字以上である必要があります',
        fullNameRequired: '氏名を入力してください',
        passwordMismatch: 'パスワードが一致しません',
        resetLinkSent: '{{email}}にパスワードリセットリンクを送信しました',
        resetPasswordDesc: 'メールアドレスを入力してください。パスワードリセットリンクを送信します。',
        registerSuccess: '登録が完了しました！',
        loginSuccess: 'ログインに成功しました！',
      },
      
      landing: {
        title: 'JLPT練習',
        subtitle: '日本語能力試験をマスターしよう',
        description: '実際の問題で練習し、即座のフィードバックと進捗追跡で上達しましょう。',
        start: '今すぐ始める',
        features: {
          practice: '練習テスト',
          practiceDesc: '全レベルの完全なJLPTテスト',
          tracking: '進捗追跡',
          trackingDesc: '時間をかけて上達を確認',
          feedback: '即座のフィードバック',
          feedbackDesc: 'すべての解答に詳しい説明',
        },
      },
      
      nav: {
        dashboard: 'ダッシュボード',
        tests: 'テスト',
        history: '履歴',
        profile: 'プロフィール',
        settings: '設定',
      },

      // Dashboard
      dashboard: {
        recentAttempts: '最近のテスト',
        weeklyActivity: '週間アクティビティ',
        last7Days: '過去7日間',
        today: '今日',
        otherDays: '他の日',
      },
      
      settings: {
        darkMode: 'ダークモード',
        language: '言語',
        theme: 'テーマ',
      },

      profile: {
        title: 'プロフィール',
        subtitle: 'アカウント設定を管理',
        editProfile: 'プロフィール編集',
        fullName: '氏名',
        email: 'メールアドレス',
        changePassword: 'パスワード変更',
        changePasswordTitle: 'パスワード変更',
        currentPassword: '現在のパスワード',
        newPassword: '新しいパスワード',
        confirmNewPassword: '新しいパスワード確認',
        updatePassword: 'パスワード更新',
        changeAvatar: 'アバター変更',
        uploadAvatar: 'アバターアップロード',
        selectImage: '画像ファイルを選択してください',
        maxSize: '最大ファイルサイズ: 5MB',
        updating: '更新中...',
        updateSuccess: 'プロフィールが更新されました！',
        avatarSuccess: 'アバターが更新されました！',
        passwordSuccess: 'パスワードが変更されました！',
        studyTime: '総学習時間',
      },

      history: {
        title: 'テスト履歴',
        subtitle: 'テスト試行と結果を表示',
        completedTests: '完了したテスト',
        incompleteTests: '未完了のテスト',
        avgScore: '平均スコア',
        highScore: '最高スコア',
        activityHeatmap: '活動ヒートマップ',
        legend: '少',
        legendMore: '多',
        testAttempts: 'テスト試行',
        noAttempts: 'まだテスト試行がありません',
        viewResults: '結果を見る',
        continueTest: 'テストを続ける',
        status: 'ステータス',
        score: 'スコア',
        date: '日付',
        passed: '合格',
        failed: '不合格',
        inProgress: '進行中',
      },    
       // Tests
      tests: {
        completed: '完了',
        inProgress: '進行中',
        sections: 'セクション',
        avgScore: '平均スコア',
      },
      
    },
  },
  
  vi: {
    translation: {
      common: {
        appName: 'JLPT',
        welcome: 'Chào mừng',
        loading: 'Đang tải...',
        error: 'Lỗi',
        success: 'Thành công',
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        save: 'Lưu',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        back: 'Quay lại',
        next: 'Tiếp theo',
        submit: 'Gửi',
        close: 'Đóng',
        completed: 'Hoàn thành',
        viewAll: 'Xem tất cả',
      },
      
      auth: {
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất',
        email: 'Email',
        password: 'Mật khẩu',
        fullName: 'Họ và tên',
        confirmPassword: 'Xác nhận mật khẩu',
        forgotPassword: 'Quên mật khẩu?',
        dontHaveAccount: 'Chưa có tài khoản?',
        alreadyHaveAccount: 'Đã có tài khoản?',
        resetPassword: 'Đặt lại mật khẩu',
        sendResetLink: 'Gửi liên kết đặt lại',
        backToLogin: 'Quay lại đăng nhập',
        invalidEmail: 'Vui lòng nhập địa chỉ email hợp lệ',
        passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
        fullNameRequired: 'Vui lòng nhập họ tên của bạn',
        passwordMismatch: 'Mật khẩu không khớp',
        resetLinkSent: 'Đã gửi liên kết đặt lại mật khẩu đến {{email}}',
        resetPasswordDesc: 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.',
        registerSuccess: 'Đăng ký thành công!',
        loginSuccess: 'Đăng nhập thành công!',
      },
      
      landing: {
        title: 'Luyện thi JLPT',
        subtitle: 'Làm chủ kỳ thi năng lực tiếng Nhật',
        description: 'Luyện tập với các đề thi JLPT thực tế, nhận phản hồi ngay lập tức và theo dõi tiến độ.',
        start: 'Bắt đầu ngay',
        features: {
          practice: 'Đề thi luyện tập',
          practiceDesc: 'Đề thi JLPT đầy đủ cho mọi cấp độ',
          tracking: 'Theo dõi tiến độ',
          trackingDesc: 'Giám sát sự tiến bộ của bạn theo thời gian',
          feedback: 'Phản hồi ngay lập tức',
          feedbackDesc: 'Giải thích chi tiết cho mọi câu trả lời',
        },
      },
      
      nav: {
        dashboard: 'Bảng điều khiển',
        tests: 'Bài kiểm tra',
        history: 'Lịch sử',
        profile: 'Hồ sơ',
        settings: 'Cài đặt',
      },

      // Dashboard
      dashboard: {
        recentAttempts: 'Bài thi gần đây',
        weeklyActivity: 'Hoạt động tuần này',
        last7Days: '7 ngày qua',
        today: 'Hôm nay',
        otherDays: 'Ngày khác',
      },
      
      settings: {
        darkMode: 'Chế độ tối',
        language: 'Ngôn ngữ',
        theme: 'Giao diện',
      },

      profile: {
        title: 'Hồ sơ',
        subtitle: 'Quản lý cài đặt tài khoản',
        editProfile: 'Chỉnh sửa hồ sơ',
        fullName: 'Họ và tên',
        email: 'Email',
        changePassword: 'Đổi mật khẩu',
        changePasswordTitle: 'Đổi mật khẩu',
        currentPassword: 'Mật khẩu hiện tại',
        newPassword: 'Mật khẩu mới',
        confirmNewPassword: 'Xác nhận mật khẩu mới',
        updatePassword: 'Cập nhật mật khẩu',
        changeAvatar: 'Đổi ảnh đại diện',
        uploadAvatar: 'Tải ảnh lên',
        selectImage: 'Vui lòng chọn tệp hình ảnh',
        maxSize: 'Kích thước tối đa: 5MB',
        updating: 'Đang cập nhật...',
        updateSuccess: 'Cập nhật hồ sơ thành công!',
        avatarSuccess: 'Cập nhật ảnh đại diện thành công!',
        passwordSuccess: 'Đổi mật khẩu thành công!',
        studyTime: 'Tổng thời gian học',
      },

      history: {
        title: 'Lịch sử bài kiểm tra',
        subtitle: 'Xem các lần làm bài và kết quả',
        completedTests: 'Bài kiểm tra hoàn thành',
        incompleteTests: 'Bài kiểm tra chưa hoàn thành',
        avgScore: 'Điểm trung bình',
        highScore: 'Điểm cao nhất',
        activityHeatmap: 'Bản đồ hoạt động',
        legend: 'Ít',
        legendMore: 'Nhiều',
        testAttempts: 'Lượt làm bài',
        noAttempts: 'Chưa có lượt làm bài nào',
        viewResults: 'Xem kết quả',
        continueTest: 'Tiếp tục làm bài',
        status: 'Trạng thái',
        score: 'Điểm',
        date: 'Ngày',
        passed: 'Đạt',
        failed: 'Không đạt',
        inProgress: 'Đang làm',
      },
       // Tests
      tests: {
        completed: 'Hoàn thành',
        inProgress: 'Đang làm',
        sections: 'Phần thi',
        avgScore: 'Điểm TB',
      },
      
    
    },
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('jlpt-language') || 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
  });

// Save language preference on change
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('jlpt-language', lng);
});

export default i18n;
