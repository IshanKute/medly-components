import { DateRangeIcon } from '@medly-components/icons';
import { parseToDate, useCombinedRefs, useOuterClickNotifier, WithStyle } from '@medly-components/utils';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Calendar from '../Calendar';
import TextField from '../TextField';
import { DateIconWrapper, Wrapper } from './DatePicker.styled';
import datePickerPattern from './datePickerPattern';
import { DatePickerProps } from './types';

const Component: React.FC<DatePickerProps> = React.memo(
    React.forwardRef((props, ref) => {
        const {
                value,
                onChange,
                size,
                displayFormat,
                fullWidth,
                minWidth,
                required,
                disabled,
                showDecorators,
                errorText,
                className,
                validator,
                popoverPlacement,
                minSelectableDate,
                maxSelectableDate,
                showCalendarIcon,
                calendarIconPosition,
                ...restProps
            } = props,
            id = props.id || props.label?.toLowerCase().replace(/\s/g, '') || 'medly-datepicker', // TODO:- Remove static ID concept to avoid dup ID
            date: Date | null = useMemo(
                () => (value instanceof Date ? value : typeof value === 'string' ? parseToDate(value, displayFormat!) : null),
                [value, displayFormat]
            );
        const wrapperRef = useRef<HTMLDivElement>(null),
            inputRef = useCombinedRefs<HTMLInputElement>(ref, React.useRef(null)),
            [inputKey, setInputKey] = useState(0),
            [textValue, setTextValue] = useState(''),
            [builtInErrorMessage, setErrorMessage] = useState(''),
            [showCalendar, toggleCalendar] = useState(false),
            [active, setActive] = useState(false),
            isErrorPresent = useMemo(() => !!errorText || !!builtInErrorMessage, [errorText, builtInErrorMessage]);

        useEffect(() => {
            date && setTextValue(format(date, displayFormat!).replace(new RegExp('\\/|\\-', 'g'), ' $& '));
        }, [date, displayFormat]);
        const onTextChange = useCallback(
                (event: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = event.target.value,
                        parsedDate = parseToDate(inputValue, displayFormat!);
                    setTextValue(inputValue);
                    onChange(parsedDate.toString() !== 'Invalid Date' ? parsedDate : null);
                },
                [displayFormat, onChange]
            ),
            onIconClick = useCallback(
                event => {
                    event.stopPropagation();
                    if (!disabled) {
                        toggleCalendar(val => !val);
                        setActive(true);
                        inputRef.current?.focus();
                    }
                },
                [disabled]
            ),
            validate = useCallback(
                (event: React.FocusEvent<HTMLInputElement>, eventFunc?: any) => {
                    const inputValue = inputRef.current?.value,
                        parsedDate = inputValue && parseToDate(inputValue, displayFormat!),
                        isValidDate = parsedDate?.toString() !== 'Invalid Date',
                        emptyDateMessage = props.required && !inputValue && 'Please fill in this field',
                        invalidDateRangeMessage =
                            (parsedDate! < minSelectableDate! || parsedDate! > maxSelectableDate!) &&
                            'Please select date from allowed range',
                        invalidDateMessage = inputValue && !isValidDate && 'Please enter a valid date',
                        validatorMessage = validator && validator(parsedDate || null, event.type),
                        message = validatorMessage || emptyDateMessage || invalidDateRangeMessage || invalidDateMessage || '';

                    setErrorMessage(message);
                    eventFunc && eventFunc(event);
                },
                [props.required, displayFormat, validator, minSelectableDate, maxSelectableDate]
            ),
            onBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => inputRef.current?.value && validate(event, props.onBlur), [
                props.onBlur,
                displayFormat
            ]),
            onInvalid = useCallback((event: React.FocusEvent<HTMLInputElement>) => validate(event, props.onInvalid), [
                props.onInvalid,
                displayFormat
            ]),
            onFocus = useCallback(
                (event: React.FocusEvent<HTMLInputElement>) => {
                    setActive(true);
                    props.onFocus && props.onFocus(event);
                },
                [props.onFocus]
            ),
            onDateChange = useCallback(
                (dt: Date) => {
                    onChange(dt);
                    toggleCalendar(false);
                    setErrorMessage('');
                    setActive(false);
                },
                [onChange]
            ),
            inputValidator = useCallback(() => '', []);

        useOuterClickNotifier((event: any) => {
            setActive(false);
            toggleCalendar(false);
            if (active) {
                validate(event, props.onBlur);
                props.onBlur && props.onBlur(event);
            }
        }, wrapperRef);

        useEffect(() => {
            date && !showCalendar && setInputKey(key => key + 1);
        }, [date, showCalendar]);

        const dateIconEl = () => (
            <DateIconWrapper variant={restProps.variant!} isErrorPresent={isErrorPresent} isActive={active} disabled={disabled} size={size}>
                <DateRangeIcon id={`${id}-calendar-icon`} title={`${id}-calendar-icon`} onClick={onIconClick} size={size} />
            </DateIconWrapper>
        );

        return (
            <Wrapper
                id={`${id}-datepicker-wrapper`}
                ref={wrapperRef}
                fullWidth={fullWidth}
                minWidth={minWidth}
                size={size}
                className={className}
                variant={restProps.variant!}
                placement={popoverPlacement!}
            >
                <TextField
                    errorText={errorText || builtInErrorMessage}
                    id={id}
                    key={inputKey}
                    ref={inputRef}
                    required={required}
                    {...(showCalendarIcon && (calendarIconPosition === 'left' ? { prefix: dateIconEl } : { suffix: dateIconEl }))}
                    fullWidth
                    mask={displayFormat!.replace(new RegExp('\\/|\\-', 'g'), ' $& ').toUpperCase()}
                    pattern={datePickerPattern[displayFormat!]}
                    size={size}
                    disabled={disabled}
                    showDecorators={showDecorators}
                    value={textValue}
                    onChange={onTextChange}
                    validator={inputValidator}
                    {...{ ...restProps, onBlur, onFocus, minWidth, onInvalid }}
                />

                {showCalendar && (
                    <Calendar
                        id={`${id}-calendar`}
                        date={date}
                        isErrorPresent={isErrorPresent}
                        onChange={onDateChange}
                        minSelectableDate={minSelectableDate!}
                        maxSelectableDate={maxSelectableDate!}
                    />
                )}
            </Wrapper>
        );
    })
);
Component.defaultProps = {
    label: '',
    value: null,
    variant: 'filled',
    displayFormat: 'MM/dd/yyyy',
    disabled: false,
    required: false,
    fullWidth: false,
    minWidth: '20rem',
    minSelectableDate: new Date(1901, 0, 1),
    maxSelectableDate: new Date(2100, 11, 1),
    popoverPlacement: 'bottom-start',
    showCalendarIcon: true,
    showDecorators: true,
    calendarIconPosition: 'right'
};
Component.displayName = 'DatePicker';
export const DatePicker: React.FC<DatePickerProps> & WithStyle = Object.assign(Component, { Style: Wrapper });
