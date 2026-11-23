package com.sheet2;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.FrameLayout;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import kotlin.jvm.internal.DefaultConstructorMarker;
import kotlin.jvm.internal.Intrinsics;

public final class InlineFooterPresenter {

    public static final Companion INSTANCE = new Companion(null);
    private static final List<View> footers = new ArrayList();
    private final AppFittedSheet anchor;
    private final View hostView;
    private FrameLayout overlay;

    public InlineFooterPresenter(AppFittedSheet anchor, View hostView) {
        Intrinsics.checkNotNullParameter(anchor, "anchor");
        Intrinsics.checkNotNullParameter(hostView, "hostView");
        this.anchor = anchor;
        this.hostView = hostView;
    }

    public final boolean isShown() {
        return this.overlay != null;
    }

    public final void show() {
        ViewGroup viewGroupFindInlineRoot;
        if (isShown() || (viewGroupFindInlineRoot = InlineFooterPresenterKt.findInlineRoot(this.anchor)) == null) {
            return;
        }
        Context context = this.anchor.getContext();
        Intrinsics.checkNotNullExpressionValue(context, "getContext(...)");
        PassThroughFrameLayout passThroughFrameLayout = new PassThroughFrameLayout(context);
        passThroughFrameLayout.setLayoutParams(new ViewGroup.LayoutParams(-1, -1));
        passThroughFrameLayout.setClickable(false);
        passThroughFrameLayout.setFocusable(false);
        ViewParent parent = this.hostView.getParent();
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup != null) {
            viewGroup.removeView(this.hostView);
        }
        ViewGroup.LayoutParams layoutParams = this.hostView.getLayoutParams();
        this.hostView.setLayoutParams(new FrameLayout.LayoutParams(layoutParams != null ? layoutParams.width : -1, layoutParams != null ? layoutParams.height : 0, 80));
        passThroughFrameLayout.addView(this.hostView);
        View view = this.hostView;
        DialogRootViewGroup dialogRootViewGroup = view instanceof DialogRootViewGroup ? (DialogRootViewGroup) view : null;
        if (dialogRootViewGroup != null) {
            dialogRootViewGroup.setFollowsContentHeight(true);
        }
        viewGroupFindInlineRoot.addView(passThroughFrameLayout);
        this.overlay = passThroughFrameLayout;
        footers.add(passThroughFrameLayout);
        this.hostView.post(new Runnable() {
            @Override
            public final void run() {
                InlineFooterPresenter.this.anchor.pushContentOriginOffset$react_native_sheet2_release();
            }
        });
    }

    public final void dismiss() {
        FrameLayout frameLayout = this.overlay;
        if (frameLayout == null) {
            return;
        }
        footers.remove(frameLayout);
        this.overlay = null;
        View view = this.hostView;
        DialogRootViewGroup dialogRootViewGroup = view instanceof DialogRootViewGroup ? (DialogRootViewGroup) view : null;
        if (dialogRootViewGroup != null) {
            dialogRootViewGroup.setFollowsContentHeight(false);
        }
        ViewParent parent = frameLayout.getParent();
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup != null) {
            viewGroup.removeView(frameLayout);
        }
        ViewParent parent2 = this.hostView.getParent();
        ViewGroup viewGroup2 = parent2 instanceof ViewGroup ? (ViewGroup) parent2 : null;
        if (viewGroup2 != null) {
            viewGroup2.removeView(this.hostView);
        }
    }

    public static final class Companion {
        public Companion(DefaultConstructorMarker defaultConstructorMarker) {
            this();
        }

        private Companion() {
        }

        public final void bringFootersToFront(ViewGroup root) {
            Intrinsics.checkNotNullParameter(root, "root");
            List list = InlineFooterPresenter.footers;
            ArrayList arrayList = new ArrayList();
            for (Object obj : list) {
                if (((View) obj).getParent() == root) {
                    arrayList.add(obj);
                }
            }
            Iterator it = arrayList.iterator();
            while (it.hasNext()) {
                ((View) it.next()).bringToFront();
            }
        }
    }
}
