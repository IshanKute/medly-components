import { DateRangeIcon } from '@medly-components/icons';
import { parseToDate, useCombinedRefs, useOuterClickNotifier, WithStyle } from '@medly-components/utils';
import { format } from 'date-fns';
import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Calendar from '../Calendar';
import Popover from '../Popover';
import TextField from '../TextField';
import { DateIcon, Wrapper } from './DatePicker.styled';
import { Props } from './types';

export const DatePicker: React.FC<Props> & WithStyle = React.memo(
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
                errorText,
                className,
                popoverPlacement,
                minSelectableDate,
                maxSelectableDate,
                mobile,
                ...restProps
            } = props,
            id = props.id || props.label.toLowerCase().replace(/\s/g, '') || 'medly-datepicker', // TODO:- Remove static ID concept to avoid dup ID
            date: Date | null = useMemo(
                () => (value instanceof Date ? value : typeof value === 'string' ? parseToDate(value, displayFormat) : null),
                [value, displayFormat]
            );
        const wrapperRef = useRef<HTMLDivElement>(null),
            inputRef = useCombinedRefs<HTMLInputElement>(ref, React.useRef(null)),
            [textValue, setTextValue] = useState(''),
            [builtInErrorMessage, setErrorMessage] = useState(''),
            [showCalendar, toggleCalendar] = useState(false),
            [active, setActive] = useState(false),
            isErrorPresent = useMemo(() => !!errorText || !!builtInErrorMessage, [errorText, builtInErrorMessage]);

        useEffect(() => {
            date && setTextValue(format(date, displayFormat).replace(new RegExp('\\/|\\-', 'g'), ' $& '));
        }, [date, displayFormat]);
        const convertDate = (d: string) => {
            if (d === '') {
                return undefined;
            }
            const [year, month, day] = d.split('-');
            return month + '/' + day + '/' + year;
        };
        const onTextChange = useCallback(
                (event: React.ChangeEvent<HTMLInputElement>) => {
                    const date = mobile ? convertDate(event.currentTarget.value) : event.currentTarget.value;
                    const inputValue = date,
                        parsedDate = parseToDate(inputValue, displayFormat);
                    setTextValue(inputValue);
                    if (parsedDate.toString() !== 'Invalid Date') {
                        if (parsedDate < minSelectableDate || parsedDate > maxSelectableDate) {
                            setErrorMessage('Please select date from allowed range');
                        } else {
                            onChange(parsedDate);
                            setErrorMessage('');
                        }
                    } else {
                        onChange(null);
                    }
                },
                [displayFormat]
            ),
            onIconClick = useCallback(
                event => {
                    event.stopPropagation();
                    if (!disabled) {
                        toggleCalendar(val => !val);
                        setActive(true);
                        inputRef.current.focus();
                    }
                },
                [disabled]
            ),
            validate = useCallback(
                (event: React.FocusEvent<HTMLInputElement>, eventFunc: (e: FormEvent<HTMLInputElement>) => void) => {
                    const date = mobile ? convertDate(event.currentTarget.value) : event.currentTarget.value;
                    date &&
                        parseToDate(date, displayFormat).toString() === 'Invalid Date' &&
                        setTimeout(() => setErrorMessage('Enter valid date'), 0);
                    props.required && !date && setTimeout(() => setErrorMessage('Please fill in this field'), 0);
                    eventFunc && eventFunc(event);
                },
                [props.required, displayFormat]
            ),
            onBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => validate(event, props.onBlur), [
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
            );
        const handleOnChangeNative = useCallback(
            (event: FormEvent<HTMLInputElement>) => {
                setTextValue(convertDate(event.currentTarget.value));
                setErrorMessage('');
                parseToDate(convertDate(event.currentTarget.value), displayFormat);
            },
            [setErrorMessage, parseToDate]
        );
        useOuterClickNotifier(() => {
            setActive(false);
            toggleCalendar(false);
        }, wrapperRef);

        const suffixEl = () => (
            <DateIcon variant={restProps.variant} isErrorPresent={isErrorPresent} isActive={active} disabled={disabled} size={size}>
                <DateRangeIcon id={`${id}-calendar-icon`} onClick={onIconClick} size={size} />
            </DateIcon>
        );
        function mobileValue() {
            console.log('this is testing', textValue);
            if (textValue) {
                const test = parseToDate(textValue, displayFormat);
                return format(test, 'yyyy-MM-dd');
            } else {
                return null;
            }
        }
        let datepickerTextField;
        if (!mobile) {
            datepickerTextField = (
                <TextField
                    errorText={errorText || builtInErrorMessage}
                    id={id}
                    ref={inputRef}
                    required={required}
                    suffix={suffixEl}
                    fullWidth
                    mask={displayFormat.replace(new RegExp('\\/|\\-', 'g'), ' $& ').toUpperCase()}
                    size={size}
                    disabled={disabled}
                    value={textValue}
                    onChange={onTextChange}
                    {...{ ...restProps, onBlur, onFocus, onInvalid }}
                />
            );
        } else {
            datepickerTextField = (
                <TextField
                    id={id}
                    ref={inputRef}
                    size={size}
                    onChange={handleOnChangeNative}
                    type="date"
                    disabled={disabled}
                    required={required}
                    value={mobileValue()}
                    errorText={errorText || builtInErrorMessage}
                    fullWidth
                    {...{ ...restProps, onBlur, onInvalid }}
                />
            );
        }
        return (
            <Wrapper
                id={`${id}-datepicker-wrapper`}
                ref={wrapperRef}
                fullWidth={fullWidth}
                minWidth={minWidth}
                size={size}
                className={className}
                placement={popoverPlacement}
            >
                {datepickerTextField}
                {showCalendar && (
                    <Calendar
                        id={`${id}-calendar`}
                        date={date}
                        isErrorPresent={isErrorPresent}
                        onChange={onDateChange}
                        minSelectableDate={minSelectableDate}
                        maxSelectableDate={maxSelectableDate}
                    />
                )}
            </Wrapper>
        );
    })
);
DatePicker.defaultProps = {
    label: '',
    value: null,
    variant: 'filled',
    displayFormat: 'MM/dd/yyyy',
    disabled: false,
    required: false,
    fullWidth: false,
    mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    minSelectableDate: new Date(1901, 0, 1),
    maxSelectableDate: new Date(2100, 11, 1),
    popoverPlacement: 'bottom-start'
};
DatePicker.displayName = 'DatePicker';
DatePicker.Style = Popover.Style;
