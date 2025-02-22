import classNames from "classnames";
import React, { HTMLAttributes } from "react";

import styles from "./Text.module.scss";

type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
type TextColor = "darkBlue" | "grey" | "grey300" | "green" | "red";
type TextElementType = "p" | "span" | "div";
type TextHTMLElement = HTMLParagraphElement | HTMLSpanElement | HTMLDivElement;

type TextAlignment = "left" | "center" | "right";

export type TextProps = HTMLAttributes<TextHTMLElement> & {
  className?: string;
  as?: TextElementType;
  size?: TextSize;
  color?: TextColor;
  bold?: boolean;
  inverseColor?: boolean;
  title?: string;
  gradient?: boolean;
  align?: TextAlignment;
};

const sizes: Record<TextSize, string> = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
};

const colors: Record<TextColor, string> = {
  darkBlue: styles.darkBlue,
  green: styles.green,
  grey: styles.grey,
  grey300: styles.grey300,
  red: styles.red,
};

const textAlignments: Record<TextAlignment, string> = {
  left: styles.left,
  center: styles.center,
  right: styles.right,
};

const getTextClassNames = ({
  size,
  color,
  bold,
  inverseColor,
  gradient,
  align,
}: Required<Pick<TextProps, "size" | "color" | "bold" | "inverseColor" | "gradient" | "align">>) =>
  classNames(styles.text, sizes[size], colors[color], textAlignments[align], {
    [styles.bold]: bold,
    [styles.inverse]: inverseColor,
    [styles.gradient]: gradient,
  });

export const Text = React.memo(
  React.forwardRef<TextHTMLElement, React.PropsWithRef<React.PropsWithChildren<TextProps>>>(
    (
      {
        as = "p",
        bold = false,
        children,
        className: classNameProp,
        size = "md",
        color = "darkBlue",
        inverseColor = false,
        gradient = false,
        align = "left",
        ...remainingProps
      },
      ref
    ) => {
      const className = classNames(
        getTextClassNames({ size, color, bold, inverseColor, gradient, align }),
        classNameProp
      );

      return React.createElement(
        as,
        {
          ...remainingProps,
          "data-type": "text",
          className,
          ref: ref as React.Ref<TextHTMLElement>,
        },
        children
      );
    }
  )
);
